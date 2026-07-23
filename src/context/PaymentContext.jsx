import { createContext, useContext, useState, useEffect } from 'react'

const PaymentContext = createContext()

export function PaymentProvider({ children }) {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('kk_payments')
    if (saved) {
      setPayments(JSON.parse(saved))
    } else {
      // Default initial payments if empty
      const initial = [
        { id: '1', type: 'bank', name: 'Bank BCA', account: '1234567890', logo: '' },
        { id: '2', type: 'ewallet', name: 'GoPay', account: '081234567890', logo: '', qr: '' }
      ]
      setPayments(initial)
      localStorage.setItem('kk_payments', JSON.stringify(initial))
    }
    setLoading(false)
  }, [])

  function savePayments(newPayments) {
    setPayments(newPayments)
    localStorage.setItem('kk_payments', JSON.stringify(newPayments))
  }

  function addPayment(payment) {
    savePayments([...payments, { ...payment, id: Date.now().toString() }])
  }

  function updatePayment(id, data) {
    savePayments(payments.map(p => p.id === id ? { ...p, ...data } : p))
  }

  function deletePayment(id) {
    savePayments(payments.filter(p => p.id !== id))
  }

  return (
    <PaymentContext.Provider value={{ payments, loading, addPayment, updatePayment, deletePayment }}>
      {children}
    </PaymentContext.Provider>
  )
}

export const usePayments = () => useContext(PaymentContext)
