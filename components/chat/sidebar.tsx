"use client"
import { Plus, History, Settings, Menu, X, LogOut, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UpgradeModal } from "@/components/subscription/upgrade-modal"
import { clearTokens } from "@/lib/auth"
import { useState } from "react"
import type { CognitoUser } from "@/lib/types"

interface SidebarProps {
  chats: Array<{ id: string; title: string }>
  onNewChat: () => void
  onLoadChat: (id: string) => void
  activeChatId: string | null
  isOpen: boolean
  onToggle: () => void
  user?: CognitoUser | null
  credentials?: number
}

export function Sidebar({
  chats,
  onNewChat,
  onLoadChat,
  activeChatId,
  isOpen,
  onToggle,
  user,
  credentials,
}: SidebarProps) {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  const handleLogout = () => {
    clearTokens()
    window.location.reload()
  }

  return (
    <>
      <button
        onClick={onToggle}
        /* Updated neon color from green to cyan */
        className="fixed top-4 left-4 z-50 lg:hidden p-2 glass-card neon-border rounded-lg hover:scale-105 transition-transform"
      >
        {isOpen ? <X size={24} className="text-cyan-400" /> : <Menu size={24} className="text-cyan-400" />}
      </button>

      <aside
        className={cn(
          /* Updated border color to cyan */
          "fixed inset-y-0 left-0 w-64 glass-card border-r border-cyan-500/20 flex flex-col p-4 transition-all duration-300 lg:static z-40 backdrop-blur-xl",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="mb-6 pt-8 lg:pt-0">
          <h1 className="flex items-center gap-2 text-2xl font-bold neon-text">
            <span className="text-2xl"> 𓅊𝓢  </span> SITA Bot
          </h1>
        </div>

        {user && (
          /* Updated gradient colors to purple/cyan */
          <div className="mb-4 p-4 glass-card neon-border rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="text-xs text-slate-400 mb-2 font-medium">Créditos disponibles</div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {credentials || 0}
                </span>
                <Zap size={20} className="text-cyan-400 animate-pulse" />
              </div>
              <Button
                onClick={() => setUpgradeModalOpen(true)}
                className="w-full gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white text-sm font-medium shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300"
              >
                <Zap size={16} />
                Mejorar Plan
              </Button>
            </div>
          </div>
        )}

        <Button
          onClick={onNewChat}
          /* Updated text color to cyan */
          className="w-full gap-2 mb-6 glass-card neon-border text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 bg-transparent"
          variant="outline"
        >
          <Plus size={20} />
          <span>Nuevo Chat</span>
        </Button>

        <nav className="flex-1 space-y-4 overflow-y-auto">
          <div>
            <button className="w-full flex items-center gap-2 p-3 rounded-lg glass-card neon-border hover:bg-cyan-500/10 text-sm font-medium transition-all duration-300">
              <History size={18} className="text-cyan-400" />
              Historial
            </button>

            <div className="mt-2 space-y-1">
              {chats.length === 0 ? (
                <p className="text-xs text-slate-500 p-3">No hay chats anteriores</p>
              ) : (
                chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      onLoadChat(chat.id)
                      onToggle()
                    }}
                    className={cn(
                      "w-full text-left text-sm p-2 rounded-lg truncate transition-all duration-300",
                      /* Updated active chat colors to cyan */
                      activeChatId === chat.id
                        ? "glass-card neon-border bg-cyan-500/20 text-cyan-400"
                        : "text-slate-400 hover:glass-card hover:neon-border",
                    )}
                    title={chat.title}
                  >
                    {chat.title}
                  </button>
                ))
              )}
            </div>
          </div>
        </nav>

        <div className="space-y-2 mt-4 border-t border-cyan-500/20 pt-4">
          <button className="w-full flex items-center gap-2 p-3 rounded-lg glass-card neon-border hover:bg-cyan-500/10 text-sm font-medium transition-all duration-300">
            <Settings size={18} className="text-cyan-400" />
            Ajustes
          </button>
          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 p-3 rounded-lg glass-card border border-red-500/30 hover:bg-red-500/10 text-sm font-medium text-red-400 hover:text-red-300 transition-all duration-300"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          )}
        </div>
      </aside>

      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
    </>
  )
}
