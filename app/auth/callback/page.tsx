"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { exchangeCodeForToken } from "@/lib/auth"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code")
        const errorParam = searchParams.get("error")

        if (errorParam) {
          setError(`Cognito error: ${errorParam}`)
          setTimeout(() => router.push("/"), 3000)
          return
        }

        if (!code) {
          setError("No authorization code received")
          setTimeout(() => router.push("/"), 3000)
          return
        }

        // Exchange code for tokens
        await exchangeCodeForToken(code)

        // Redirect to home
        router.push("/")
      } catch (err) {
        console.error("[v0] Auth callback error:", err)
        setError("Failed to authenticate. Please try again.")
        setTimeout(() => router.push("/"), 3000)
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center">
        {loading && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Completando autenticación...</p>
          </>
        )}
        {error && (
          <>
            <p className="text-red-500 mb-4">{error}</p>
            <p className="text-gray-400 text-sm">Redirigiendo...</p>
          </>
        )}
      </div>
    </div>
  )
}
