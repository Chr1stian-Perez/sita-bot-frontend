export const getCognitoConfig = () => {
  return {
    region: process.env.NEXT_PUBLIC_COGNITO_REGION,
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    clientSecret: process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET,
    redirectUri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI,
    logoutUri: process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URI,
    domain:
      process.env.NEXT_PUBLIC_COGNITO_DOMAIN ||
      `https://cognito-idp.${process.env.NEXT_PUBLIC_COGNITO_REGION}.amazonaws.com`,
  }
}

// Generate authorization URL for OIDC login
export const getAuthorizationUrl = () => {
  const config = getCognitoConfig()
  const nonce = Math.random().toString(36).substring(7)
  const state = Math.random().toString(36).substring(7)

  // Store nonce and state in sessionStorage for verification on callback
  if (typeof window !== "undefined") {
    sessionStorage.setItem("cognito_nonce", nonce)
    sessionStorage.setItem("cognito_state", state)
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    scope: "openid email phone",
    redirect_uri: config.redirectUri,
    state: state,
    nonce: nonce,
  })

  const url = `${config.domain}/oauth2/authorize?${params.toString()}`

  if (typeof window !== "undefined") {
    console.log("[v0] Auth config:", {
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      domain: config.domain,
      url: url.split("?")[0], // Log without full params for security
    })
  }

  return url
}

// Generate logout URL
export const getLogoutUrl = () => {
  const config = getCognitoConfig()
  const params = new URLSearchParams({
    client_id: config.clientId,
    logout_uri: config.logoutUri,
  })
  return `${config.domain}/logout?${params}`
}

// Exchange authorization code for tokens
export const exchangeCodeForToken = async (code: string) => {
  try {
    const response = await fetch("/api/auth/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
    if (!response.ok) throw new Error("Token exchange failed")
    const data = await response.json()
    localStorage.setItem("access_token", data.access_token)
    localStorage.setItem("id_token", data.id_token)
    return data
  } catch (error) {
    console.error("[v0] Token exchange error:", error)
    throw error
  }
}

// Validate token with backend
export const validateToken = async (token: string) => {
  try {
    if (!token) return null
    const response = await fetch("/api/auth/validate", {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("[v0] Token validation error:", error)
    return null
  }
}

export const validateTokenWithCognito = async (token: string) => {
  try {
    const config = getCognitoConfig()

    // Decode JWT without verification to get header
    const parts = token.split(".")
    if (parts.length !== 3) {
      throw new Error("Invalid token format")
    }

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString())

    // Verify token with Cognito UserInfo endpoint
    const response = await fetch(`${config.domain}/oauth2/userInfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Token validation failed")
    }

    const userInfo = await response.json()

    return {
      sub: userInfo.sub || payload.sub,
      email: userInfo.email,
      phone_number: userInfo.phone_number,
      username: userInfo.username,
    }
  } catch (error) {
    console.error("[Auth] Token validation error:", error)
    throw new Error("Invalid or expired token")
  }
}

// Get stored token
export const getToken = () => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

// Clear tokens on logout
export const clearTokens = () => {
  localStorage.removeItem("access_token")
  localStorage.removeItem("id_token")
  sessionStorage.removeItem("cognito_nonce")
  sessionStorage.removeItem("cognito_state")
}
