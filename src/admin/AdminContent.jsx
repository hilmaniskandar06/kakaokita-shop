import { useEffect, useState, useRef } from 'react'
import AdminShell from './AdminShell'
import { useSiteContent } from '../context/SiteContentContext'
import { useToast } from '../context/ToastContext'
import { resizeImage } from '../utils/image'

const FIELDS = [
  { key: 'shopName', label: 'Nama Toko (Tampil di navigasi & footer)', type: 'input' },
  { key: 'heroEyebrow', label: 'Label kecil di atas judul hero', type: 'input' },
  { key: 'heroTitle', label: 'Judul Hero (halaman beranda)', type: 'textarea' },
  { key: 'heroSubtitle', label: 'Subjudul Hero', type: 'textarea' },
  { key: 'footerDescription', label: 'Deskripsi Singkat di Footer', type: 'textarea' },
  { key: 'socialInstagram', label: 'Link Instagram', type: 'input' },
  { key: 'socialFacebook', label: 'Link Facebook', type: 'input' },
  { key: 'socialTiktok', label: 'Link TikTok', type: 'input' },
  { key: 'socialTwitter', label: 'Link Twitter/X', type: 'input' },
  { key: 'shippingFee', label: 'Ongkos Kirim (Rp)', type: 'number' },
  { key: 'serviceFee', label: 'Biaya Layanan (Rp)', type: 'number' },
]

export default function AdminContent() {
  const { content, loading, updateContent } = useSiteContent()
  const { addToast } = useToast()
  const [form, setForm] = useState(content)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)
  const logoRef = useRef(null)

  useEffect(() => {
    if (!loading) setForm(content)
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form }
      if ('shippingFee' in payload) payload.shippingFee = Number(payload.shippingFee)
      if ('serviceFee' in payload) payload.serviceFee = Number(payload.serviceFee)

      // Upload media
      const { uploadImage } = await import('../services/storageService')
      
      if (payload.heroMedia && payload.heroMedia.startsWith('data:')) {
        const ext = payload.heroMediaType === 'video' ? 'mp4' : 'jpg'
        payload.heroMedia = await uploadImage(payload.heroMedia, `site-hero-${Date.now()}.${ext}`, 'public')
      }
      
      if (payload.shopLogo && payload.shopLogo.startsWith('data:')) {
        payload.shopLogo = await uploadImage(payload.shopLogo, `site-logo-${Date.now()}.jpg`, 'public')
      }

      await updateContent(payload)
      addToast('Konten situs diperbarui')
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.message.includes('exceeded the quota')) {
        addToast('Gagal: Kuota penyimpanan penuh. Gunakan ukuran file yang lebih kecil.', 'error')
      } else {
        addToast(err.message || 'Gagal memperbarui konten', 'error')
      }
    }
    setSaving(false)
  }

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? 20 * 1024 * 1024 : 2 * 1024 * 1024 // 20MB for video, 2MB for image
    
    if (file.size > maxSize) {
      return addToast(`Ukuran maksimal ${isVideo ? '20MB' : '2MB'}`, 'error')
    }
    
    setForm(s => ({ ...s, heroMediaType: isVideo ? 'video' : 'image' }))

    if (isVideo) {
      const reader = new FileReader()
      reader.onload = ev => setForm(s => ({ ...s, heroMedia: ev.target.result }))
      reader.readAsDataURL(file)
    } else {
      try {
        const dataUrl = await resizeImage(file, 1280) // 1280px max width for hero
        setForm(s => ({ ...s, heroMedia: dataUrl }))
      } catch {
        addToast('Gagal memproses gambar', 'error')
      }
    }
  }

  async function handleLogoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return addToast('Ukuran maksimal 2MB', 'error')
    if (!file.type.startsWith('image/')) return addToast('Logo harus berupa gambar', 'error')
    try {
      const dataUrl = await resizeImage(file, 400) // 400px max width for logo
      setForm(s => ({ ...s, shopLogo: dataUrl }))
    } catch {
      addToast('Gagal memproses gambar logo', 'error')
    }
  }

  if (loading) {
    return (
      <AdminShell title="Kelola Konten Situs">
        <p className="text-sm text-cacao-600">Memuat...</p>
      </AdminShell>
    )
  }

  return (
    <AdminShell title="Kelola Konten Situs">
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white border border-cream-300 rounded-xl p-6 flex flex-col gap-5">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-cacao-600 mb-1.5">{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                rows={2}
                value={form[f.key] || ''}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                className="w-full bg-cream-100 border border-cream-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500"
              />
            ) : (
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                value={form[f.key] ?? (f.type === 'number' ? 0 : '')}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                className="w-full bg-cream-100 border border-cream-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-gold-500"
              />
            )}
          </div>
        ))}
        
        <div className="pt-4 border-t border-cream-200">
          <label className="block text-xs font-medium text-cacao-600 mb-1">Latar Belakang Hero (Gambar / Video)</label>
          <p className="text-[10px] text-cacao-500 mb-3">Maks 2MB. Format: JPG/PNG/WEBP/MP4. Disarankan rasio landscape (misal 16:9).</p>
          <div className="flex flex-col gap-3">
            {form.heroMedia ? (
              form.heroMediaType === 'video' ? (
                <video src={form.heroMedia} className="w-full max-w-sm rounded border object-cover h-40" autoPlay loop muted />
              ) : (
                <img src={form.heroMedia} className="w-full max-w-sm rounded border object-cover h-40" alt="Hero Background" />
              )
            ) : (
              <div className="w-full max-w-sm h-40 bg-cream-100 border-2 border-dashed border-cream-300 rounded flex items-center justify-center text-cacao-400 text-sm">
                Belum ada media
              </div>
            )}
            <div className="flex gap-2 items-center">
              <input type="file" accept="image/*,video/mp4,video/webm" className="hidden" ref={fileRef} onChange={handleFileChange} />
              <button type="button" onClick={() => fileRef.current.click()} className="text-sm font-semibold border border-cream-300 px-4 py-2 rounded-lg hover:bg-cream-100">
                Pilih Media
              </button>
              {form.heroMedia && (
                <button type="button" onClick={() => setForm(s => ({ ...s, heroMedia: '', heroMediaType: 'image' }))} className="text-sm text-rose-500 font-semibold hover:text-rose-600">
                  Hapus
                </button>
              )}
            </div>
            <div className="mt-2">
              <label className="block text-xs font-medium text-cacao-600 mb-1.5">Tipe Render</label>
              <select value={form.heroMediaType || 'image'} onChange={e => setForm(s => ({ ...s, heroMediaType: e.target.value }))} className="bg-cream-100 border border-cream-300 rounded-lg px-3 py-2 text-sm outline-none">
                <option value="image">Gambar (img)</option>
                <option value="video">Video (video autoPlay)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-cream-200">
          <label className="block text-xs font-medium text-cacao-600 mb-1">Logo Toko (Opsional)</label>
          <p className="text-[10px] text-cacao-500 mb-3">Menggantikan teks nama toko jika ada. Maks 2MB. Format: JPG/PNG/WEBP. Disarankan rasio memanjang atau 1:1.</p>
          <div className="flex flex-col gap-3">
            {form.shopLogo ? (
              <img src={form.shopLogo} className="h-16 object-contain bg-cream-200 rounded p-2" alt="Logo" />
            ) : (
              <div className="w-40 h-16 bg-cream-100 border-2 border-dashed border-cream-300 rounded flex items-center justify-center text-cacao-400 text-xs">
                Belum ada logo
              </div>
            )}
            <div className="flex gap-2 items-center">
              <input type="file" accept="image/*" className="hidden" ref={logoRef} onChange={handleLogoChange} />
              <button type="button" onClick={() => logoRef.current.click()} className="text-sm font-semibold border border-cream-300 px-4 py-2 rounded-lg hover:bg-cream-100">
                Pilih Logo
              </button>
              {form.shopLogo && (
                <button type="button" onClick={() => setForm(s => ({ ...s, shopLogo: '' }))} className="text-sm text-rose-500 font-semibold hover:text-rose-600">
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          disabled={saving}
          className="self-start bg-gold-500 hover:bg-gold-400 text-cacao-900 font-bold px-6 py-3 rounded-full transition-colors disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </AdminShell>
  )
}
