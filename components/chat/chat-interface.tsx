"use client"

import { useState } from "react"
import type { ChatMessage, Chat, CognitoUser } from "@/lib/types"
import { apiGet, apiPost } from "@/lib/api"

export function ChatInterface() {
  const [chats, setChats] = useState<Chat[]>([])
  const [user, setUser] = useState<CognitoUser | null>(null)
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const loadChatsFromS3 = async () => {
    try {
      console.log("[v0] Starting to load chats from backend...")
      const token = localStorage.getItem("access_token")

      if (!token) {
        console.log("[v0] No access token found")
        return
      }

      const response = await apiGet("/api/chats", token)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Loaded chats from backend:", data.chats)
        setChats(data.chats)
      }
    } catch (error) {
      console.error("[v0] Error loading chats:", error)
    }
  }

  const loadUserInfo = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (token) {
        setUser({ sub: token } as CognitoUser)
      }
    } catch (error) {
      console.error("Error loading user info:", error)
    }
  }

  const saveChatToS3 = async (chatId: string, chatMessages: ChatMessage[]) => {
    try {
      const token = localStorage.getItem("access_token")
      await apiPost("/api/chats/save", { chatId, messages: chatMessages }, token || undefined)
      console.log(`[Chat] Saved chat ${chatId} to S3`)
    } catch (error) {
      console.error("[Chat] Error saving to S3:", error)
    }
  }

  const handleSendMessage = async (text: string) => {
    setLoading(true)

    try {
      const token = localStorage.getItem("access_token")
      const response = await apiPost("/api/chat", { message: text, conversationHistory }, token || "demo-token")

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor")
      }

      const data = await response.json()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }
}
