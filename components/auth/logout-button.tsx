"use client"

import { getLogoutUrl, clearTokens } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const handleLogout = () => {
    clearTokens()
    const url = getLogoutUrl()
    window.location.href = url
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
    >
      Cerrar Sesión
    </Button>
  )
}
