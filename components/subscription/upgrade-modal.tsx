"use client"

import { useState } from "react"
import { getToken } from "@/lib/auth"
import { apiPost } from "@/lib/api"
import type { UpgradeModalProps } from "@/types/subscription"

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async (planType: "pro" | "enterprise") => {
    setLoading(true)
    try {
      const token = getToken()
      if (!token) {
        alert("Debes estar autenticado para mejorar el plan")
        return
      }

      const response = await apiPost("/api/subscription/upgrade", { planType }, token)

      if (response.ok) {
        await response.json()
        alert("¡Plan mejorado! Lambda actualizará tus créditos en breve.")
        onOpenChange(false)
      } else {
        alert("Error al mejorar el plan")
      }
    } catch (error) {
      console.error("Upgrade error:", error)
      alert("Error al mejorar el plan")
    } finally {
      setLoading(false)
    }
  }
}
