import "./MessageBubble.css"
import { Loader } from "lucide-react"

function MessageBubble({ message }) {
  const isUser = message.role === "user"
  const isThinking = message.isThinking

  return (
    <div className={`message-bubble ${isUser ? "user" : "bot"} ${isThinking ? "thinking" : ""}`}>
      {isThinking && (
        <div className="thinking-indicator">
          <Loader size={16} className="spinner" />
        </div>
      )}
      <div className="message-content">{message.content}</div>
    </div>
  )
}

export default MessageBubble
