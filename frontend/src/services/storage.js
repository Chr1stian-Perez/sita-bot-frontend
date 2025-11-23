export function getChatHistory() {
  const stored = localStorage.getItem("sitabot-chats")
  return stored ? JSON.parse(stored) : []
}

export function saveChatHistory(chats) {
  localStorage.setItem("sitabot-chats", JSON.stringify(chats))
}
