"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ChatInterface } from "@/components/chat/chat-interface"
import { LoginButton } from "@/components/auth/login-button"
import { getToken, validateToken } from "@/lib/auth"

export default function ClientPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a token stored
        const token = getToken()

        if (token) {
          // Validate token with backend
          const validation = await validateToken(token)
          if (validation?.valid) {
            setIsAuthenticated(true)
          } else {
            setIsAuthenticated(false)
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("[v0] Auth check error:", error)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-8">SITA Bot</h1>
          <p className="text-gray-400 mb-8">Asistente inteligente con servicios AWS</p>
          <LoginButton />
        </div>
      </div>
    )
  }

  return <ChatInterface />
}
