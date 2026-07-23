import { createContext, useContext, useEffect, useState } from 'react'
import { useProducts } from './ProductsContext'

const CartContext = createContext(null)
const STORAGE_KEY = 'kk_cart'

export function CartProvider({ children }) {
  const { getById } = useProducts()
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addItem(id, qty = 1) {
    setItems((prev) => ({ ...prev, [id]: (prev[id] || 0) + qty }))
  }

  function removeItem(id) {
    setItems((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function setQty(id, qty) {
    if (qty < 1) return removeItem(id)
    setItems((prev) => ({ ...prev, [id]: qty }))
  }

  function clearCart() {
    setItems({})
  }

  const cartList = Object.entries(items)
    .map(([id, qty]) => {
      const product = getById(id)
      return product ? { ...product, qty } : null
    })
    .filter(Boolean)

  const totalCount = cartList.reduce((s, i) => s + i.qty, 0)
  const subtotal = cartList.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <CartContext.Provider
      value={{ items, cartList, totalCount, subtotal, addItem, removeItem, setQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
