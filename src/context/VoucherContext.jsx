import { createContext, useContext, useState, useEffect } from 'react'

const VoucherContext = createContext()

export function VoucherProvider({ children }) {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('kk_vouchers')
    if (saved) {
      setVouchers(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  function saveVouchers(newVouchers) {
    setVouchers(newVouchers)
    localStorage.setItem('kk_vouchers', JSON.stringify(newVouchers))
  }

  function addVoucher(voucher) {
    saveVouchers([...vouchers, { ...voucher, id: Date.now().toString(), used: 0 }])
  }

  function updateVoucher(id, data) {
    saveVouchers(vouchers.map(v => v.id === id ? { ...v, ...data } : v))
  }

  function deleteVoucher(id) {
    saveVouchers(vouchers.filter(v => v.id !== id))
  }

  function verifyVoucher(code, subtotal) {
    const v = vouchers.find(x => x.code === code)
    if (!v) return { valid: false, error: 'Voucher tidak ditemukan' }
    
    if (v.minOrder && subtotal < v.minOrder) {
      return { valid: false, error: `Minimal belanja Rp${Number(v.minOrder).toLocaleString('id-ID')}` }
    }
    if (v.expiryDate && new Date() > new Date(v.expiryDate)) {
      return { valid: false, error: 'Voucher sudah kadaluarsa' }
    }
    if (v.usageLimit && v.used >= v.usageLimit) {
      return { valid: false, error: 'Batas pemakaian voucher sudah habis' }
    }

    let discount = 0
    if (v.type === 'nominal') {
      discount = Number(v.value)
    } else if (v.type === 'persentase') {
      discount = Math.floor((subtotal * Number(v.value)) / 100)
      if (v.maxDiscount && discount > v.maxDiscount) {
        discount = v.maxDiscount
      }
    }

    if (discount > subtotal) {
      discount = subtotal
    }

    return { valid: true, voucher: v, discount }
  }

  function incrementVoucherUsage(id) {
    saveVouchers(vouchers.map(v => v.id === id ? { ...v, used: (v.used || 0) + 1 } : v))
  }

  return (
    <VoucherContext.Provider value={{ vouchers, loading, addVoucher, updateVoucher, deleteVoucher, verifyVoucher, incrementVoucherUsage }}>
      {children}
    </VoucherContext.Provider>
  )
}

export const useVouchers = () => useContext(VoucherContext)
