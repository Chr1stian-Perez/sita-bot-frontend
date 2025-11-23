const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`

  console.log(`[API] Calling ${endpoint}`)

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(`[API Error] ${endpoint}:`, error)
    throw new Error(error)
  }

  return response
}

export async function apiGet(endpoint: string, token?: string) {
  return apiRequest(endpoint, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export async function apiPost(endpoint: string, body: any, token?: string) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}
