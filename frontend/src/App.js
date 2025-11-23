"use client"

import { useState, useCallback } from "react"
import "./App.css"
import Sidebar from "./components/Sidebar"
import ChatArea from "./components/ChatArea"
import { getChatHistory } from "./services/storage"

function App() {
  const [chats, setChats] = useState(getChatHistory())
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  // Crear nuevo chat
  const handleNewChat = useCallback(() => {
    const newChatId = Date.now().toString()
    const newChat = { id: newChatId, title: "Nuevo Chat", messages: [], createdAt: new Date() }
    setChats((prev) => [newChat, ...prev])
    setActiveChatId(newChatId)
    setMessages([])
  }, [])

  // Cargar chat del historial
  const handleLoadChat = useCallback(
    (chatId) => {
      const chat = chats.find((c) => c.id === chatId)
      if (chat) {
        setActiveChatId(chatId)
        setMessages(chat.messages)
      }
    },
    [chats],
  )

  // Enviar mensaje
  const handleSendMessage = useCallback(
    async (text) => {
      if (!activeChatId) {
        handleNewChat()
        return
      }

      const userMessage = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() }
      setMessages((prev) => [...prev, userMessage])
      setLoading(true)

      try {
        // Simular "pensando"
        const thinkingDuration = Math.random() * 3000 + 2000 // 2-5 segundos
        const thinkingMessage = {
          id: `thinking-${Date.now()}`,
          role: "assistant",
          content: `Pensando... (${(thinkingDuration / 1000).toFixed(2)}s)`,
          isThinking: true,
          duration: thinkingDuration,
        }
        setMessages((prev) => [...prev, thinkingMessage])

        await new Promise((resolve) => setTimeout(resolve, thinkingDuration))

        // Simular respuesta de la API (será reemplazada por llamada real)
        const botResponse = {
          id: Date.now().toString(),
          role: "assistant",
          content: `Respuesta simulada para: "${text.substring(0, 30)}..."`,
          timestamp: new Date(),
        }

        setMessages((prev) => {
          const filtered = prev.filter((m) => !m.isThinking)
          return [...filtered, botResponse]
        })

        // Actualizar chat en historial
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChatId ? { ...chat, messages: [...chat.messages, userMessage, botResponse] } : chat,
          ),
        )
      } catch (error) {
        console.error("Error enviando mensaje:", error)
      } finally {
        setLoading(false)
      }
    },
    [activeChatId, handleNewChat],
  )

  return (
    <div className="app-container">
      <Sidebar chats={chats} onNewChat={handleNewChat} onLoadChat={handleLoadChat} activeChatId={activeChatId} />
      <ChatArea messages={messages} onSendMessage={handleSendMessage} loading={loading} />
    </div>
  )
}

export default App
