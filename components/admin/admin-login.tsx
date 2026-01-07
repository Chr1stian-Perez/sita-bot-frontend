"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminLoginProps {
  onAuthenticated: () => void
}

export function AdminLogin({ onAuthenticated }: AdminLoginProps) {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const checkAuth = async () => {
    setLoading(true)
    setError("")
    
    try {
      const token = localStorage.getItem("access_token")
      
      console.log("[v0] Token exists:", !!token)
      
      if (!token) {
        setError("Por favor inicia sesión primero en la página principal")
        setLoading(false)
        return
      }

      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("[v0] Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Response data:", data)
        
        if (data.isAdmin) {
          onAuthenticated()
        } else {
          setError("No tienes permisos de administrador")
        }
      } else {
        setError(`Error del servidor: ${response.status}`)
      }
    } catch (err) {
      console.error("[v0] Error:", err)
      setError("Error de conexión con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Panel de Administrador</CardTitle>
          <CardDescription>Acceso restringido</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          <Button onClick={checkAuth} className="w-full" disabled={loading}>
            {loading ? "Verificando..." : "Verificar Acceso"}
          </Button>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Si no has iniciado sesión, vuelve a la{" "}
            <a href="/" className="text-blue-400 hover:underline">
              página principal
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
