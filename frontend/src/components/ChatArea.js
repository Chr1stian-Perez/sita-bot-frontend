"use client"

import { useState, useRef, useEffect } from "react"
import "./ChatArea.css"
import { Send } from "lucide-react"
import MessageBubble from "./MessageBubble"

function ChatArea({ messages, onSendMessage, loading }) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (input.trim() && !loading) {
      onSendMessage(input)
      setInput("")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-area">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h2>Bienvenido a SITA Bot</h2>
            <p>Comienza una nueva conversación escribiendo tu pregunta abajo</p>
          </div>
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-section">
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pregunta a SITA Bot..."
            disabled={loading}
            className="message-input"
          />
          <button onClick={handleSend} disabled={loading || !input.trim()} className="send-btn">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatArea
