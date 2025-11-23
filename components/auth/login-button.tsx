"use client"

import { getAuthorizationUrl } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export function LoginButton() {
  const handleLogin = () => {
    try {
      console.log("[v0] Login button clicked")
      const url = getAuthorizationUrl()
      console.log("[v0] Redirecting to:", url.split("?")[0])
      window.location.href = url
    } catch (error) {
      console.error("[v0] Login error:", error)
      alert("Error iniciando sesión. Revisa la consola.")
    }
  }

  return (
    <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-white">
      Iniciar Sesión con Cognito
    </Button>
  )
}
