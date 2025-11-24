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
  const [credentials, setCredentials] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      setAuthModalOpen(true)
    } else {
      loadUserInfo()
      loadChatsFromS3()
      loadCredits()
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

        const transformedChats = data.chats.map((chat: any) => ({
          id: chat.id, // Use chat.id from backend
          title: chat.title, // Use title from backend
          messages: chat.messages || [],
          createdAt: new Date(chat.createdAt),
          userId: chat.userId,
        }))

        const sortedChats = transformedChats.sort((a: Chat, b: Chat) => b.createdAt.getTime() - a.createdAt.getTime())

        setChats(sortedChats)
        console.log(`[v0] Successfully loaded ${sortedChats.length} chats`)
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
        method: "POST",
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

  const loadCredits = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch("/api/credits", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Loaded credits:", data.credits)
        setCredentials(data.credits)
      }
    } catch (error) {
      console.error("Error loading credits:", error)
      setCredentials(50) // Fallback
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

  const handleLoadChat = async (chatId: string) => {
    try {
      if (!chatId) {
        console.error("[v0] Cannot load chat: chatId is undefined")
        return
      }

      const localChat = chats.find((c) => c.id === chatId)
      if (localChat && localChat.messages.length > 0) {
        console.log("[v0] Loading chat from local state:", chatId)
        setActiveChatId(chatId)
        setMessages(localChat.messages)
        setSidebarOpen(false)
        return
      }

      console.log("[v0] Loading chat from server:", chatId)
      const token = localStorage.getItem("access_token")

      const response = await fetch(`/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const chatData = await response.json()
        console.log("[v0] Chat data loaded:", chatData)

        const loadedMessages = (chatData.messages || []).map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        }))

        setActiveChatId(chatId)
        setMessages(loadedMessages)
        setSidebarOpen(false)
      } else {
        const errorData = await response.json()
        console.error("[v0] Failed to load chat:", errorData)
      }
    } catch (error) {
      console.error("[v0] Error loading chat:", error)
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

    if (credentials === null || credentials <= 0) {
      alert("No tienes créditos disponibles. Por favor mejora tu plan.")
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    const currentMessages = [...messages, userMessage]
    setMessages(currentMessages)
    setLoading(true)

    const thinkingMessageId = `thinking-${Date.now()}`
    const thinkingStartTime = Date.now()
    let thinkingInterval: NodeJS.Timeout | null = null

    const thinkingMessage: ChatMessage = {
      id: thinkingMessageId,
      role: "assistant",
      content: "Pensando 0.0 s",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, thinkingMessage])

    thinkingInterval = setInterval(() => {
      const elapsed = ((Date.now() - thinkingStartTime) / 1000).toFixed(1)
      setMessages((prev) =>
        prev.map((msg) => (msg.id === thinkingMessageId ? { ...msg, content: `Pensando ${elapsed} s` } : msg)),
      )
    }, 100)

    try {
      const messagesForBackend = currentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      console.log("[v0] Sending messages to backend:", messagesForBackend.length)

      const token = localStorage.getItem("access_token")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || "demo-token"}`,
        },
        body: JSON.stringify({
          messages: messagesForBackend,
        }),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No se pudo leer la respuesta")
      }

      if (thinkingInterval) {
        clearInterval(thinkingInterval)
      }

      const assistantMessageId = (Date.now() + 1).toString()
      let fullContent = ""

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== thinkingMessageId),
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ])

      console.log("[v0] Starting to read stream...")

      let buffer = ""
      let chunkCount = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log("[v0] Stream complete. Total chunks:", chunkCount)
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") {
              console.log("[v0] Received [DONE] signal")
              continue
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                chunkCount++
                fullContent += parsed.content
                console.log("[v0] Chunk", chunkCount, "- Length:", fullContent.length)

                setMessages((prevMessages) => {
                  return prevMessages.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          content: fullContent,
                          timestamp: new Date(), // Force re-render
                        }
                      : msg,
                  )
                })
              }
              if (parsed.error) {
                console.error("[v0] Stream error:", parsed.error)
                throw new Error(parsed.error)
              }
            } catch (e) {
              console.error("[v0] Parse error:", e, "Line:", line)
            }
          }
        }
      }

      console.log("[v0] Final content length:", fullContent.length)

      await loadCredits()

      const finalMessages = [
        ...currentMessages,
        {
          id: assistantMessageId,
          role: "assistant" as const,
          content: fullContent,
          timestamp: new Date(),
        },
      ]

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: finalMessages,
                title: chat.title === "Nuevo Chat" ? text.substring(0, 30) : chat.title,
              }
            : chat,
        ),
      )

      await saveChatToS3(currentChatId, finalMessages)
    } catch (error) {
      console.error("[v0] Error sending message:", error)

      if (thinkingInterval) {
        clearInterval(thinkingInterval)
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== thinkingMessageId),
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Lo siento, ocurrió un error al procesar tu mensaje.",
          timestamp: new Date(),
        },
      ])
    } finally {
      if (thinkingInterval) {
        clearInterval(thinkingInterval)
      }
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
          loadCredits()
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
        credentials={credentials ?? 0}
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
