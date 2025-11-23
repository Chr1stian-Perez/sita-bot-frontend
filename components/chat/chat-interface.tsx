"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { ChatArea } from "./chat-area"
import { AuthModal } from "@/components/auth/auth-modal"
import type { ChatMessage, Chat, CognitoUser } from "@/lib/types"

export function ChatInterface() {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<CognitoUser | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [credentials, setCredentials] = useState(1000)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      setAuthModalOpen(true)
    } else {
      loadUserInfo()
      loadChatsFromS3()
    }
  }, [])

  const loadChatsFromS3 = async () => {
    try {
      console.log("[v0] Starting to load chats from S3...")
      const token = localStorage.getItem("access_token")

      if (!token) {
        console.log("[v0] No access token found")
        return
      }

      console.log("[v0] Fetching chats from /api/chats...")
      const response = await fetch("/api/chats", {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("[v0] Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Loaded chats from S3:", data.chats)
        setChats(data.chats)
        console.log(`[v0] Successfully loaded ${data.chats.length} chats`)
      } else {
        const error = await response.text()
        console.error("[v0] Failed to load chats:", error)
      }
    } catch (error) {
      console.error("[v0] Error loading chats from S3:", error)
    }
  }

  const loadUserInfo = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch("/api/auth/validate", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error("Error loading user info:", error)
    }
  }

  const saveChatToS3 = async (chatId: string, chatMessages: ChatMessage[]) => {
    try {
      const token = localStorage.getItem("access_token")
      await fetch("/api/chats/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId,
          messages: chatMessages,
        }),
      })
      console.log(`[Chat] Saved chat ${chatId} to S3`)
    } catch (error) {
      console.error("[Chat] Error saving to S3:", error)
    }
  }

  const handleNewChat = () => {
    const newChatId = Date.now().toString()
    const newChat: Chat = {
      id: newChatId,
      title: "Nuevo Chat",
      messages: [],
      createdAt: new Date(),
      userId: user?.sub,
    }
    setChats((prev) => [newChat, ...prev])
    setActiveChatId(newChatId)
    setMessages([])
  }

  const handleLoadChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId)
    if (chat) {
      setActiveChatId(chatId)
      setMessages(chat.messages)
      setSidebarOpen(false)
    }
  }

  const handleSendMessage = async (text: string) => {
    let currentChatId = activeChatId

    if (!currentChatId) {
      const newChatId = Date.now().toString()
      const newChat: Chat = {
        id: newChatId,
        title: text.substring(0, 30),
        messages: [],
        createdAt: new Date(),
        userId: user?.sub,
      }
      setChats((prev) => [newChat, ...prev])
      setActiveChatId(newChatId)
      currentChatId = newChatId
    }

    if (credentials <= 0) {
      alert("No tienes créditos disponibles. Por favor mejora tu plan.")
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const thinkingDuration = Math.random() * 3000 + 2000
      const thinkingMessage: ChatMessage = {
        id: `thinking-${Date.now()}`,
        role: "assistant",
        content: `Pensando... (${(thinkingDuration / 1000).toFixed(2)}s)`,
        isThinking: true,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, thinkingMessage])
      await new Promise((resolve) => setTimeout(resolve, thinkingDuration))

      const conversationHistory = messages
        .filter((m) => !m.isThinking)
        .map((m) => ({
          role: m.role === "user" ? "user" : "model",
          text: m.content,
        }))

      const token = localStorage.getItem("access_token")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || "demo-token"}`,
        },
        body: JSON.stringify({
          message: text,
          conversationHistory,
        }),
      })

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor")
      }

      const data = await response.json()

      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isThinking)
        return [...filtered, botMessage]
      })

      setCredentials((prev) => Math.max(0, prev - 1))

      const updatedMessages = [...messages.filter((m) => !m.isThinking), userMessage, botMessage]

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: updatedMessages,
                title: chat.title === "Nuevo Chat" ? text.substring(0, 30) : chat.title,
              }
            : chat,
        ),
      )

      await saveChatToS3(currentChatId, updatedMessages)
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Lo siento, ocurrió un error al procesar tu mensaje.",
        timestamp: new Date(),
      }
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isThinking)
        return [...filtered, errorMessage]
      })
    } finally {
      setLoading(false)
    }
  }

  if (authModalOpen) {
    return (
      <AuthModal
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={() => {
          setAuthModalOpen(false)
          loadUserInfo()
          loadChatsFromS3()
        }}
      />
    )
  }

  return (
    <div className="flex w-full h-screen bg-slate-900 text-slate-50">
      <Sidebar
        chats={chats}
        onNewChat={handleNewChat}
        onLoadChat={handleLoadChat}
        activeChatId={activeChatId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        credentials={credentials}
      />
      <ChatArea
        messages={messages}
        onSendMessage={handleSendMessage}
        loading={loading}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  )
}
