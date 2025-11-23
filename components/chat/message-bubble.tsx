"use client"

import { Loader2 } from "lucide-react"
import type { ChatMessage } from "@/lib/types"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const isThinking = message.isThinking

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-xl px-5 py-3 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300",
          /* Updated colors from green to cyan/teal */
          isUser
            ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            : isThinking
              ? "glass-card border-2 border-cyan-500 text-cyan-400 animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              : "glass-card neon-border text-slate-100 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300",
        )}
      >
        <div className="flex items-center gap-2">
          {isThinking && <Loader2 size={16} className="animate-spin text-cyan-400" />}
          {!isUser && !isThinking ? (
            <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-strong:text-cyan-300 prose-strong:font-semibold prose-code:text-cyan-300 prose-code:bg-slate-800/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-a:text-cyan-400 prose-a:underline">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
      </div>
    </div>
  )
}
