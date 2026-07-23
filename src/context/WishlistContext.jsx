import { createContext, useContext, useEffect, useState } from 'react'
import { useProducts } from './ProductsContext'

const WishlistContext = createContext(null)
const STORAGE_KEY = 'kk_wishlist'

export function WishlistProvider({ children }) {
  const { getById } = useProducts()
  const [ids, setIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }, [ids])

  useEffect(() => {
    // Prune invalid IDs
    const validIds = ids.filter(id => !!getById(id))
    if (validIds.length !== ids.length) {
      setIds(validIds)
    }
  }, [])

  function toggle(id) {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function isWishlisted(id) {
    return ids.includes(id)
  }

  const wishlistItems = ids.map(getById).filter(Boolean)

  return (
    <WishlistContext.Provider value={{ ids, wishlistItems, toggle, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
