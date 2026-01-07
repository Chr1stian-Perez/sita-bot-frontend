"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Check } from "lucide-react"
import { getToken } from "@/lib/auth"

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planType }),
      })

      if (response.ok) {
        await response.json()
        alert("¡Plan mejorado! Se actualizará tus créditos en breve.")
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

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "USD / mes",
      description: "Mira lo que la IA puede hacer",
      features: ["25 créditos/mes", "Soporte por email", "Historial de chats limitado", "Generación básica"],
      buttonText: "Tu plan actual",
      highlight: false,
      recommended: false,
      credits: 25
    },
    {
      name: "Pro",
      price: "$20",
      period: "USD / mes",
      description: "Descubre toda la experiencia",
      features: ["1,000 créditos/mes", "Soporte prioritario", "Análisis avanzado", "Acceso a API", "Memoria extendida"],
      recommended: true,
      buttonText: "Obtener Pro",
      highlight: true,
      credits: 1000
    },
    {
      name: "Enterprise",
      price: "$200",
      period: "USD / mes",
      description: "Maximiza tu productividad",
      features: ["10,000 créditos/mes", "Soporte 24/7", "Account manager dedicado", "SLA garantizado", "SSO disponible"],
      recommended: false,
      buttonText: "Obtener Enterprise",
      highlight: false,
      credits: 10000
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* CONFIGURACIÓN DEL MODAL PRINCIPAL:
          - !max-w-6xl: Fuerza el ancho amplio para que quepan las 3 columnas cómodamente.
          - bg-black/85 + backdrop-blur-xl: Crea el efecto vidrio ahumado transparente.
          - border-white/10: Borde sutil elegante.
      */}
      <DialogContent className="!max-w-5xl w-[80vw] bg-black/100 backdrop-blur-x1 border border-white/10 p-0 overflow-hidden shadow-2xl sm:rounded-3xl">
        
        <DialogHeader className="p-8 pb-4 text-center md:text-left">
          <DialogTitle className="text-3xl font-bold text-white">Mejora tu plan</DialogTitle>
          <DialogDescription className="text-slate-300 text-lg">
             Elige el plan perfecto para potenciar tus proyectos.
          </DialogDescription>
        </DialogHeader>

        {/* Grid responsivo: 1 columna en móvil, 3 en escritorio con divisores sutiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-6 lg:p-8 transition-colors duration-300 ${
                // Fondo sutilmente diferente para el destacado, pero manteniendo transparencia
                plan.highlight ? "bg-white/5" : "hover:bg-white/[0.02]"
              }`}
            >
              {plan.recommended && (
                 <div className="absolute top-6 right-6">
                   <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white border-0 px-3 py-1 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                     POPULAR
                   </Badge>
                 </div>
              )}

              {/* 1. Nombre del Plan */}
              <h3 className="text-xl font-semibold text-white mb-4">{plan.name}</h3>

              {/* 2. Precio y Periodo */}
              <div className="flex flex-wrap items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-white tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm text-slate-300 font-medium whitespace-nowrap">
                  {plan.period}
                </span>
              </div>

              {/* 3. Descripción (Color aclarado para lectura) */}
              <p className="text-sm text-slate-300 mb-8 h-auto min-h-[2.5rem] leading-relaxed">
                {plan.description}
              </p>

              {/* 4. Botón de Acción */}
              <Button
                onClick={() => handleUpgrade(plan.name.toLowerCase() as "pro" | "enterprise")}
                disabled={loading || plan.name === "Free"}
                className={`w-full h-12 rounded-full font-semibold mb-8 text-sm transition-all ${
                  plan.highlight
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : plan.name === "Free" 
                      ? "bg-transparent border border-white/20 text-slate-300 cursor-default hover:bg-transparent"
                      : "bg-white text-black hover:bg-slate-200 border border-transparent"
                }`}
              >
                {loading && plan.name !== "Free" ? "Procesando..." : plan.buttonText}
              </Button>

              {/* 5. Lista de Características */}
              <div className="flex flex-col gap-4 mt-auto">
                 {/* Créditos destacados */}
                 <div className="flex items-center gap-3 text-base font-medium text-white">
                    <Zap className={`w-5 h-5 ${plan.highlight ? 'text-indigo-400' : 'text-yellow-400'}`} fill="currentColor" />
                    {plan.credits.toLocaleString()} Créditos
                 </div>

                 {/* Resto de features */}
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <span className="text-left leading-tight">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
