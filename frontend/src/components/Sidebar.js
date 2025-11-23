"use client"

import { useState } from "react"
import "./Sidebar.css"
import { Plus, History, Settings, Menu, X } from "lucide-react"

function Sidebar({ chats, onNewChat, onLoadChat, activeChatId }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <button className="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <h1>SITA Bot</h1>
          </div>
        </div>

        <button className="new-chat-btn" onClick={onNewChat}>
          <Plus size={20} />
          <span>Nuevo Chat</span>
        </button>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <button className="nav-item">
              <History size={18} />
              <span>Historial</span>
            </button>
            <div className="chat-history">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  className={`chat-item ${activeChatId === chat.id ? "active" : ""}`}
                  onClick={() => onLoadChat(chat.id)}
                  title={chat.title}
                >
                  {chat.title}
                </button>
              ))}
            </div>
          </div>

          <div className="nav-section">
            <button className="nav-item">
              <Settings size={18} />
              <span>Ajustes</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
