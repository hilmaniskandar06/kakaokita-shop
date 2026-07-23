import { useState, useEffect } from 'react'
import { Users, Trash2, Edit2, Plus, Info, X } from 'lucide-react'
import AdminShell from './AdminShell'
import { useToast } from '../context/ToastContext'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('Aktif')
  
  const { addToast } = useToast()

  useEffect(() => {
    loadCustomers()
  }, [])

  function loadCustomers() {
    const saved = JSON.parse(localStorage.getItem('kk_users') || '[]')
    setCustomers(saved)
  }

  function deleteCustomer(id) {
    if (confirm('Hapus/nonaktifkan pelanggan ini? Data tidak akan benar-benar hilang tapi akun ditandai dihapus.')) {
      const saved = JSON.parse(localStorage.getItem('kk_users') || '[]')
      const updated = saved.map(c => c.id === id ? { ...c, deletedAt: new Date().toISOString() } : c)
      localStorage.setItem('kk_users', JSON.stringify(updated))
      setCustomers(updated)
      addToast('Pelanggan ditandai dihapus')
    }
  }

  function permanentDeleteCustomer(id) {
    if (confirm('PERINGATAN: Akun ini akan dihapus secara permanen dari sistem. Anda yakin?')) {
      const saved = JSON.parse(localStorage.getItem('kk_users') || '[]')
      const updated = saved.filter(c => c.id !== id)
      localStorage.setItem('kk_users', JSON.stringify(updated))
      setCustomers(updated)
      addToast('Akun pelanggan dihapus permanen')
    }
  }

  function handleSave(e) {
    e.preventDefault()
    const saved = JSON.parse(localStorage.getItem('kk_users') || '[]')
    
    if (editingId) {
      const updated = saved.map(c => c.id === editingId ? { ...c, name: form.name, email: form.email, phone: form.phone, password: form.password || c.password } : c)
      localStorage.setItem('kk_users', JSON.stringify(updated))
      setCustomers(updated)
      addToast('Data pelanggan diperbarui')
    } else {
      if (saved.find(c => c.email === form.email)) {
        addToast('Email sudah terdaftar', 'error')
        return
      }
      const newUser = {
        id: 'USR-' + Date.now(),
        ...form,
        joinedAt: new Date().toISOString(),
        address: {}
      }
      saved.push(newUser)
      localStorage.setItem('kk_users', JSON.stringify(saved))
      setCustomers(saved)
      addToast('Pelanggan baru ditambahkan')
    }
    setShowModal(false)
  }

  function openEdit(c) {
    setForm({ name: c.name, email: c.email, phone: c.phone, password: '' })
    setEditingId(c.id)
    setShowModal(true)
  }

  function openCreate() {
    setForm({ name: '', email: '', phone: '', password: '' })
    setEditingId(null)
    setShowModal(true)
  }

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone.includes(searchTerm)
    
    const matchesTab = activeTab === 'Aktif' ? !c.deletedAt : !!c.deletedAt
    return matchesSearch && matchesTab
  }).sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))

  return (
    <AdminShell 
      title="Kelola Pelanggan"
      actions={
        <button onClick={openCreate} className="flex items-center gap-2 bg-cacao-900 text-white font-bold px-4 py-2 rounded-lg hover:bg-cacao-800 transition-colors">
          <Plus size={16} /> Tambah Pelanggan
        </button>
      }
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex bg-cream-200 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('Aktif')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'Aktif' ? 'bg-white text-cacao-900 shadow-sm' : 'text-cacao-600 hover:text-cacao-900'}`}
          >
            Aktif
          </button>
          <button 
            onClick={() => setActiveTab('Dihapus')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'Dihapus' ? 'bg-white text-cacao-900 shadow-sm' : 'text-cacao-600 hover:text-cacao-900'}`}
          >
            Dihapus
          </button>
        </div>
        <input 
          type="text" 
          placeholder="Cari nama, email, atau telepon..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-cream-300 outline-none focus:border-cacao-500"
        />
      </div>

      <div className="bg-white border border-cream-300 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-200 text-left text-cacao-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Pelanggan</th>
              <th className="px-4 py-3 font-semibold">Kontak</th>
              <th className="px-4 py-3 font-semibold">Bergabung</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(c => (
              <tr key={c.id} className="border-t border-cream-200">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-cacao-500">
                      <Users size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-cacao-900">{c.name}</div>
                      <div className="text-xs text-cacao-500 font-mono">{c.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-cacao-900">{c.email}</span>
                    <span className="text-xs text-cacao-500">{c.phone}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span>{new Date(c.joinedAt).toLocaleDateString('id-ID')}</span>
                    {c.deletedAt && <span className="text-xs text-rose-500 font-bold">Dihapus pada {new Date(c.deletedAt).toLocaleDateString('id-ID')}</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setShowDetail(c)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream-200 text-cacao-600" title="Lihat Detail">
                      <Info size={14} />
                    </button>
                    {!c.deletedAt ? (
                      <>
                        <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream-200 text-cacao-600" title="Edit Akun">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteCustomer(c.id)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-50 text-rose-500" title="Hapus Akun Sementara">
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => permanentDeleteCustomer(c.id)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-50 text-rose-500" title="Hapus Permanen">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-cacao-500">Tidak ada pelanggan yang cocok</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-cacao-900/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-xl">{editingId ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h3>
              <button onClick={() => setShowModal(false)} className="text-cacao-500 hover:text-cacao-900"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Lengkap</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:border-gold-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:border-gold-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Telepon</label>
                <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:border-gold-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Password {editingId && <span className="text-xs font-normal text-cacao-500">(kosongkan jika tidak ingin mengubah)</span>}</label>
                <input required={!editingId} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:border-gold-500 outline-none" />
              </div>
              <button type="submit" className="w-full bg-gold-500 hover:bg-gold-400 text-cacao-900 font-bold py-2 rounded-lg mt-2">
                Simpan
              </button>
            </form>
          </div>
        </div>
      )}

      {showDetail && (
        <div className="fixed inset-0 z-50 bg-cacao-900/50 flex items-center justify-center px-4" onClick={() => setShowDetail(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-xl">Detail Pelanggan</h3>
              <button onClick={() => setShowDetail(null)} className="text-cacao-500 hover:text-cacao-900"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs font-semibold text-cacao-500">ID Pelanggan</div>
                <div className="font-mono">{showDetail.id}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-cacao-500">Nama</div>
                <div className="font-bold text-base">{showDetail.name}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-cacao-500">Alamat Tersimpan</div>
                <div>
                  {showDetail.address?.detail ? (
                    <>
                      {showDetail.address.detail}<br />
                      {showDetail.address.desa}, {showDetail.address.kecamatan}<br />
                      {showDetail.address.kota}, {showDetail.address.provinsi} {showDetail.address.kodePos}
                    </>
                  ) : (
                    <span className="text-cacao-500 italic">Belum ada alamat</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
