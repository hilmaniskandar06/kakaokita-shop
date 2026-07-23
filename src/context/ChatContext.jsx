import { createContext, useContext, useState, useEffect } from 'react'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([])

  // Load from local storage
  const loadChats = () => {
    const saved = JSON.parse(localStorage.getItem('kk_chats') || '[]')
    setChats(saved)
  }

  useEffect(() => {
    loadChats()
    // Sync across tabs
    const handleStorage = (e) => {
      if (e.key === 'kk_chats') {
        loadChats()
      }
    }
    window.addEventListener('storage', handleStorage)
    
    // Fallback polling for same-tab mock real-time (not strictly necessary but helps if not using storage events properly)
    const interval = setInterval(loadChats, 2000)
    return () => {
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
    }
  }, [])

  function saveChats(newChats) {
    localStorage.setItem('kk_chats', JSON.stringify(newChats))
    setChats(newChats)
  }

  function sendMessage(userId, userName, text, sender = 'user') {
    const currentChats = [...chats]
    let chatSession = currentChats.find(c => c.userId === userId)
    
    const newMessage = {
      id: 'msg-' + Date.now() + Math.random(),
      sender,
      text,
      time: new Date().toISOString(),
      read: false
    }

    if (chatSession) {
      chatSession.messages.push(newMessage)
      chatSession.lastUpdated = new Date().toISOString()
      if (sender === 'user') {
        chatSession.userName = userName // Update name if changed
      }
    } else {
      chatSession = {
        id: 'chat-' + userId,
        userId,
        userName,
        lastUpdated: new Date().toISOString(),
        messages: [newMessage]
      }
      currentChats.push(chatSession)
    }

    saveChats(currentChats)
  }

  function markAsRead(userId, reader = 'user') {
    const currentChats = [...chats]
    const chatSession = currentChats.find(c => c.userId === userId)
    if (chatSession) {
      let changed = false
      chatSession.messages.forEach(m => {
        // If reader is user, mark admin messages as read
        if (reader === 'user' && m.sender === 'admin' && !m.read) {
          m.read = true
          changed = true
        }
        // If reader is admin, mark user messages as read
        if (reader === 'admin' && m.sender === 'user' && !m.read) {
          m.read = true
          changed = true
        }
      })
      if (changed) {
        saveChats(currentChats)
      }
    }
  }

  function getUnreadCount(userId, role = 'user') {
    if (role === 'admin') {
      return chats.reduce((total, chat) => {
        return total + chat.messages.filter(m => m.sender === 'user' && !m.read).length
      }, 0)
    } else {
      const chatSession = chats.find(c => c.userId === userId)
      if (!chatSession) return 0
      return chatSession.messages.filter(m => m.sender === 'admin' && !m.read).length
    }
  }

  return (
    <ChatContext.Provider value={{ chats, sendMessage, markAsRead, getUnreadCount }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  return useContext(ChatContext)
}
