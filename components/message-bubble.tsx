// Extracted from chat-area.tsx for reusability
"use client"

import type { ChatMessage } from "@/lib/types"
import { Loader2 } from "lucide-react"

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-lg ${
          message.role === "user"
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            : message.isThinking
              ? "bg-slate-700 text-slate-300 flex items-center gap-2"
              : "bg-slate-700 text-slate-100"
        }`}
      >
        {message.isThinking ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {message.content}
          </>
        ) : (
          <p className="text-sm leading-relaxed">{message.content}</p>
        )}
      </div>
    </div>
  )
}
