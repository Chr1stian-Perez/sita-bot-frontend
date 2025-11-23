"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getAuthorizationUrl } from "@/lib/auth"

interface AuthModalProps {
  onClose: () => void
  onAuthenticated: () => void
}

export function AuthModal({ onClose, onAuthenticated }: AuthModalProps) {
  const handleLogin = () => {
    const loginUrl = getAuthorizationUrl()
    window.location.href = loginUrl
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Inicia sesión en SITA Bot</DialogTitle>
          <DialogDescription className="text-slate-400">
            Por favor autentícate con Amazon Cognito para continuar
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            Iniciar sesión con Cognito
          </Button>
          <p className="text-xs text-slate-500 text-center">
            Serás redirigido a Amazon Cognito para completar la autenticación
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
