import { useState, useEffect } from 'react'
import { Eye, CheckCircle, XCircle, Trash2, Image as ImageIcon, Printer } from 'lucide-react'
import AdminShell from './AdminShell'
import { useToast } from '../context/ToastContext'
import { useNotifications } from '../context/NotificationContext'
import OrderSummaryCard from '../components/OrderSummaryCard'

const STATUS_LABELS = {
  belum_dibayar: { label: 'Belum Dibayar', class: 'bg-cacao-100 text-cacao-700' },
  menunggu_verifikasi: { label: 'Menunggu Verifikasi', class: 'bg-gold-100 text-gold-700' },
  diproses: { label: 'Diproses', class: 'bg-sky-100 text-sky-700' },
  dikirim: { label: 'Dikirim', class: 'bg-indigo-100 text-indigo-700' },
  selesai: { label: 'Selesai', class: 'bg-ok-100 text-ok-700' },
  dibatalkan: { label: 'Dibatalkan', class: 'bg-rose-100 text-rose-700' }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [viewProof, setViewProof] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  
  // prompt for resi or cancel reason
  const [statusPrompt, setStatusPrompt] = useState(null)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [cancelReasonType, setCancelReasonType] = useState('Stok habis')
  const [cancelReasonText, setCancelReasonText] = useState('')

  const { addToast } = useToast()
  const { addNotification } = useNotifications()

  useEffect(() => {
    loadOrders()
  }, [])

  function loadOrders() {
    const saved = JSON.parse(localStorage.getItem('kk_orders') || '[]')
    setOrders(saved)
  }

  function updateStatus(id, newStatus) {
    if (newStatus === 'dikirim' || newStatus === 'dibatalkan') {
      setStatusPrompt({ id, newStatus })
      setTrackingNumber('')
      setCancelReasonType('Stok habis')
      setCancelReasonText('')
      return
    }
    
    commitStatusUpdate(id, newStatus)
  }

  function commitStatusUpdate(id, newStatus, extraData = {}) {
    const saved = JSON.parse(localStorage.getItem('kk_orders') || '[]')
    const updated = saved.map(o => o.id === id ? { ...o, paymentStatus: newStatus, ...extraData } : o)
    localStorage.setItem('kk_orders', JSON.stringify(updated))
    setOrders(updated)
    addToast(`Status pesanan diperbarui menjadi ${STATUS_LABELS[newStatus].label}`)
    
    // Send Notification
    const order = saved.find(o => o.id === id)
    if (order && order.userId) {
      if (newStatus === 'dikirim') {
        addNotification(order.userId, 'Pesanan Dikirim', `Pesanan ${id} Anda sedang dalam perjalanan. No. Resi: ${extraData.trackingNumber}`, `/pesanan/${id}`)
      } else if (newStatus === 'dibatalkan') {
        addNotification(order.userId, 'Pesanan Dibatalkan', `Pesanan ${id} dibatalkan. Alasan: ${extraData.cancelReason}`, `/pesanan/${id}`)
      } else if (newStatus === 'diproses') {
        addNotification(order.userId, 'Pesanan Diproses', `Hore! Pembayaran pesanan ${id} telah dikonfirmasi dan sedang diproses.`, `/pesanan/${id}`)
      }
    }
    
    setStatusPrompt(null)
  }

  function handlePromptSubmit(e) {
    e.preventDefault()
    if (statusPrompt.newStatus === 'dikirim') {
      if (!trackingNumber) return addToast('Nomor resi wajib diisi', 'error')
      commitStatusUpdate(statusPrompt.id, 'dikirim', { trackingNumber })
    } else if (statusPrompt.newStatus === 'dibatalkan') {
      const reason = cancelReasonType === 'Lainnya' ? cancelReasonText : cancelReasonType
      if (!reason) return addToast('Alasan pembatalan wajib diisi', 'error')
      commitStatusUpdate(statusPrompt.id, 'dibatalkan', { cancelReason: reason })
    }
  }

  function deleteOrder(id) {
    if (confirm('Hapus pesanan ini secara permanen?')) {
      const saved = JSON.parse(localStorage.getItem('kk_orders') || '[]')
      const filtered = saved.filter(o => o.id !== id)
      localStorage.setItem('kk_orders', JSON.stringify(filtered))
      setOrders(filtered)
      addToast('Pesanan dihapus')
    }
  }

  return (
    <AdminShell title="Kelola Pesanan">
      <div className="bg-white border border-cream-300 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-200 text-left text-cacao-700">
            <tr>
              <th className="px-4 py-3 font-semibold">ID & Tanggal</th>
              <th className="px-4 py-3 font-semibold">Pelanggan</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const status = o.paymentStatus || 'belum_dibayar'
              const statusData = STATUS_LABELS[status]
              
              return (
                <tr key={o.id} className="border-t border-cream-200">
                  <td className="px-4 py-3">
                    <div className="font-bold text-cacao-900">{o.id}</div>
                    <div className="text-xs text-cacao-500">{new Date(o.date).toLocaleDateString('id-ID')}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-cacao-900">{o.customer?.name}</div>
                    <div className="text-xs text-cacao-500">{o.customer?.phone}</div>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold">
                    Rp{o.total?.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusData.class}`}>
                      {statusData.label}
                    </span>
                    {o.paymentProof && (
                      <button onClick={() => setViewProof(o.paymentProof)} className="mt-2 text-xs flex items-center gap-1 text-gold-600 hover:text-gold-500 font-semibold">
                        <ImageIcon size={14} /> Bukti Transfer
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <select 
                        value={status} 
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="text-xs border rounded-lg px-2 py-1.5 outline-none bg-cream-50"
                      >
                        {Object.entries(STATUS_LABELS).map(([key, val]) => (
                          <option key={key} value={key}>{val.label}</option>
                        ))}
                      </select>
                      <button onClick={() => setSelectedOrder(o)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gold-50 text-gold-600" title="Lihat Detail">
                        <Eye size={14} />
                      </button>
                      <a href={`/invoice/${o.id}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cacao-100 text-cacao-600" title="Cetak Invoice">
                        <Printer size={14} />
                      </a>
                      <button onClick={() => deleteOrder(o.id)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-50 text-rose-500" title="Hapus">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {orders.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-cacao-500">Belum ada pesanan</td></tr>}
          </tbody>
        </table>
      </div>

      {viewProof && (
        <div className="fixed inset-0 z-50 bg-cacao-900/80 flex items-center justify-center p-5">
          <div className="bg-white rounded-xl overflow-hidden max-w-lg w-full">
            <div className="p-4 border-b flex justify-between items-center bg-cream-100">
              <h3 className="font-bold text-cacao-900">Bukti Transfer</h3>
              <button onClick={() => setViewProof(null)} className="text-cacao-500 hover:text-cacao-900"><XCircle size={20} /></button>
            </div>
            <div className="p-5 flex justify-center">
              <img src={viewProof} alt="Bukti Transfer" className="max-w-full max-h-[70vh] rounded border" />
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-cacao-900/80 flex items-center justify-center p-5">
          <div className="bg-white rounded-xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-cream-100 shrink-0">
              <h3 className="font-bold text-cacao-900">Detail Pesanan: {selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-cacao-500 hover:text-cacao-900"><XCircle size={20} /></button>
            </div>
            <div className="p-5 overflow-y-auto">
              <OrderSummaryCard order={selectedOrder} />
            </div>
          </div>
        </div>
      )}

      {statusPrompt && (
        <div className="fixed inset-0 z-50 bg-cacao-900/80 flex items-center justify-center p-5">
          <div className="bg-white rounded-xl overflow-hidden max-w-md w-full">
            <div className="p-4 border-b flex justify-between items-center bg-cream-100 shrink-0">
              <h3 className="font-bold text-cacao-900">
                {statusPrompt.newStatus === 'dikirim' ? 'Input Nomor Resi' : 'Alasan Pembatalan'}
              </h3>
              <button onClick={() => setStatusPrompt(null)} className="text-cacao-500 hover:text-cacao-900"><XCircle size={20} /></button>
            </div>
            <form onSubmit={handlePromptSubmit} className="p-5 flex flex-col gap-4">
              {statusPrompt.newStatus === 'dikirim' ? (
                <div>
                  <label className="block text-sm font-medium text-cacao-900 mb-1">Nomor Resi Ekspedisi</label>
                  <input 
                    type="text" 
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:border-gold-500" 
                    placeholder="Contoh: JNT-123456789"
                    required
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-cacao-900 mb-1">Pilih Alasan</label>
                    <select 
                      value={cancelReasonType}
                      onChange={e => setCancelReasonType(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 outline-none"
                    >
                      <option value="Stok habis">Stok habis</option>
                      <option value="Melewati batas waktu pembayaran">Melewati batas waktu pembayaran</option>
                      <option value="Alamat pengiriman di luar jangkauan">Alamat pengiriman di luar jangkauan</option>
                      <option value="Lainnya">Lainnya (Tulis manual)</option>
                    </select>
                  </div>
                  {cancelReasonType === 'Lainnya' && (
                    <div>
                      <label className="block text-sm font-medium text-cacao-900 mb-1">Tulis Alasan Manual</label>
                      <textarea 
                        value={cancelReasonText}
                        onChange={e => setCancelReasonText(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 outline-none focus:border-gold-500 min-h-[80px]" 
                        placeholder="Tuliskan alasan spesifik..."
                        required
                      />
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setStatusPrompt(null)} className="px-4 py-2 text-sm font-bold text-cacao-600 hover:bg-cream-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold bg-gold-500 hover:bg-gold-400 text-cacao-900 rounded-lg">
                  Simpan & Kirim Notif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
