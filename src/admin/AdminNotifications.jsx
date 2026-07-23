import { useState, useEffect } from 'react'
import { Bell, Trash2, Send, Users } from 'lucide-react'
import AdminShell from './AdminShell'
import { useNotifications } from '../context/NotificationContext'
import { useToast } from '../context/ToastContext'

export default function AdminNotifications() {
  const { getAllNotifications, addNotification, deleteNotification } = useNotifications()
  const { addToast } = useToast()
  
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ userId: 'ALL', title: '', message: '' })
  
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('kk_users') || '[]')
    setUsers(savedUsers.filter(u => !u.deletedAt))
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.message) return addToast('Judul dan pesan wajib diisi', 'error')
    
    addNotification(form.userId, form.title, form.message)
    addToast('Notifikasi berhasil dikirim')
    setForm({ userId: 'ALL', title: '', message: '' })
  }

  function handleDelete(id) {
    if (confirm('Hapus riwayat notifikasi ini? (Akan terhapus juga dari sisi pengguna)')) {
      deleteNotification(id)
      addToast('Notifikasi dihapus')
    }
  }

  const notifications = getAllNotifications()

  return (
    <AdminShell title="Kelola Notifikasi">
      <div className="grid md:grid-cols-[360px_1fr] gap-6">
        <div className="bg-white border border-cream-300 rounded-xl p-5 h-fit">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Send size={18} className="text-gold-600" /> Kirim Notifikasi Baru
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-cacao-600 mb-1">Tujuan / Penerima</label>
              <select 
                value={form.userId} 
                onChange={e => setForm({...form, userId: e.target.value})} 
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="ALL">Broadcast (Semua Pelanggan)</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-cacao-600 mb-1">Judul Notifikasi</label>
              <input 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-500" 
                required 
                placeholder="Contoh: Flash Sale Cokelat!" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-cacao-600 mb-1">Isi Pesan</label>
              <textarea 
                value={form.message} 
                onChange={e => setForm({...form, message: e.target.value})} 
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-500 min-h-[100px]" 
                required 
                placeholder="Tulis pesan lengkap di sini..." 
              />
            </div>
            <button type="submit" className="w-full bg-gold-500 hover:bg-gold-400 text-cacao-900 font-bold py-2.5 rounded-lg mt-2 transition-colors">
              Kirim Notifikasi
            </button>
          </form>
        </div>

        <div className="bg-white border border-cream-300 rounded-xl overflow-hidden">
          <div className="p-4 bg-cream-100 border-b flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Bell size={18} /> Riwayat Notifikasi
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-50 text-left text-cacao-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Waktu & Penerima</th>
                  <th className="px-4 py-3 font-semibold">Konten Notifikasi</th>
                  <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map(n => {
                  const targetUser = users.find(u => u.id === n.userId)
                  const targetLabel = n.userId === 'ALL' 
                    ? <span className="inline-flex items-center gap-1 bg-gold-100 text-gold-700 px-2 py-0.5 rounded text-xs font-bold"><Users size={12}/> Broadcast</span>
                    : <span className="text-xs text-cacao-600">Ke: {targetUser ? targetUser.name : n.userId}</span>

                  return (
                    <tr key={n.id} className="border-t border-cream-200">
                      <td className="px-4 py-3 align-top">
                        <div className="text-xs text-cacao-500 mb-1">{new Date(n.date).toLocaleString('id-ID')}</div>
                        {targetLabel}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-bold text-cacao-900 mb-1">{n.title}</div>
                        <div className="text-xs text-cacao-700 line-clamp-2">{n.message}</div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center justify-end">
                          <button onClick={() => handleDelete(n.id)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-50 text-rose-500" title="Hapus">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {notifications.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-10 text-center text-cacao-500">Belum ada riwayat notifikasi</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
