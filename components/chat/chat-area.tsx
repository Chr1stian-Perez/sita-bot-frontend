"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { MessageBubble } from "./message-bubble"
import type { ChatMessage } from "@/lib/types"

interface ChatAreaProps {
  messages: ChatMessage[]
  onSendMessage: (text: string) => void
  loading: boolean
  onToggleSidebar: () => void
}

export function ChatArea({ messages, onSendMessage, loading, onToggleSidebar }: ChatAreaProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (input.trim() && !loading) {
      onSendMessage(input)
      setInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex-1 flex flex-col relative bg-slate-900">
      <div className="matrix-background absolute inset-0" />
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 relative z-10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#00ffaa] to-[#0ea5e9] bg-clip-text text-transparent">
              Bienvenido a SITA Bot
            </h2>
            <p className="text-slate-400">Comienza una nueva conversación escribiendo tu pregunta</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <div className="border-t border-[#00ffaa]/20 p-4 relative z-10 backdrop-blur-sm">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <div className="flex-1 flex gap-2 glass-card neon-border rounded-xl px-4 py-3 transition-all duration-300 focus-within:shadow-[0_0_20px_rgba(0,255,170,0.3)]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pregunta a SITA Bot..."
              disabled={loading}
              rows={1}
              className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none resize-none"
              style={{ minHeight: "24px", maxHeight: "100px" }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ffaa] to-[#0ea5e9] hover:from-[#00e5a0] hover:to-[#0284c7] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,170,0.5)]"
          >
            <Send size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
