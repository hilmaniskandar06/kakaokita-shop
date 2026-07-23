import { createContext, useContext, useState, useEffect } from 'react'

const NotificationContext = createContext({})

export function useNotifications() {
  return useContext(NotificationContext)
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    loadNotifications()
  }, [])

  function loadNotifications() {
    const saved = JSON.parse(localStorage.getItem('kk_notifications') || '[]')
    setNotifications(saved)
  }

  function addNotification(userId, title, message, link = null) {
    const saved = JSON.parse(localStorage.getItem('kk_notifications') || '[]')
    const newNotif = {
      id: 'NOTF-' + Date.now(),
      userId,
      title,
      message,
      link,
      date: new Date().toISOString(),
      isRead: false
    }
    saved.unshift(newNotif) // Add to top
    localStorage.setItem('kk_notifications', JSON.stringify(saved))
    setNotifications(saved)
  }

  function markAsRead(id) {
    const saved = JSON.parse(localStorage.getItem('kk_notifications') || '[]')
    const updated = saved.map(n => n.id === id ? { ...n, isRead: true } : n)
    localStorage.setItem('kk_notifications', JSON.stringify(updated))
    setNotifications(updated)
  }
  
  function markAllAsRead(userId) {
    const saved = JSON.parse(localStorage.getItem('kk_notifications') || '[]')
    // We only mark read for notifications belonging to this user
    // Wait, if it's 'ALL', how do we mark it read for ONE user without affecting others?
    // We should probably store an array of readBy user IDs for broadcast notifications.
    const updated = saved.map(n => {
      if (n.userId === userId) {
        return { ...n, isRead: true }
      }
      if (n.userId === 'ALL') {
        const readBy = n.readBy || []
        if (!readBy.includes(userId)) {
          return { ...n, readBy: [...readBy, userId] }
        }
      }
      return n
    })
    localStorage.setItem('kk_notifications', JSON.stringify(updated))
    setNotifications(updated)
  }
  
  // also update markAsRead for single notification
  function markSingleAsRead(id, userId) {
    const saved = JSON.parse(localStorage.getItem('kk_notifications') || '[]')
    const updated = saved.map(n => {
      if (n.id === id) {
        if (n.userId === 'ALL') {
          const readBy = n.readBy || []
          if (!readBy.includes(userId)) {
            return { ...n, readBy: [...readBy, userId] }
          }
          return n
        } else {
          return { ...n, isRead: true }
        }
      }
      return n
    })
    localStorage.setItem('kk_notifications', JSON.stringify(updated))
    setNotifications(updated)
  }

  // Get notifications specific to a user (including broadcast 'ALL')
  function getUserNotifications(userId) {
    return notifications.filter(n => n.userId === userId || n.userId === 'ALL').map(n => {
      if (n.userId === 'ALL') {
        return { ...n, isRead: (n.readBy || []).includes(userId) }
      }
      return n
    })
  }

  // Admin gets all notifications
  function getAllNotifications() {
    return notifications
  }
  
  function deleteNotification(id) {
    const saved = JSON.parse(localStorage.getItem('kk_notifications') || '[]')
    const filtered = saved.filter(n => n.id !== id)
    localStorage.setItem('kk_notifications', JSON.stringify(filtered))
    setNotifications(filtered)
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markSingleAsRead,
      markAllAsRead,
      getUserNotifications,
      getAllNotifications,
      deleteNotification
    }}>
      {children}
    </NotificationContext.Provider>
  )
}
