import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Truck, ShieldCheck } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import ProductThumb from '../components/ProductThumb'
import { useProducts } from '../context/ProductsContext'
import { useCategories } from '../context/CategoriesContext'
import { useSiteContent } from '../context/SiteContentContext'
import { useToast } from '../context/ToastContext'
import { useState } from 'react'

export default function Home() {
  const { products, loading } = useProducts()
  const { categories } = useCategories()
  const { content } = useSiteContent()
  const featured = products.filter((p) => p.rating >= 4.7).slice(0, 8)
  const onSale = products.filter((p) => p.oldPrice)
  const { addToast } = useToast()
  if (loading) {
    return <div className="max-w-7xl mx-auto px-5 py-24 text-center text-cacao-500">Memuat produk...</div>
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cacao-900 text-white">
        {content.heroMedia && (
          <div className="absolute inset-0 z-0">
            {content.heroMediaType === 'video' ? (
              <video src={content.heroMedia} className="w-full h-full object-cover opacity-40" autoPlay loop muted playsInline />
            ) : (
              <img src={content.heroMedia} className="w-full h-full object-cover opacity-40" alt="" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-cacao-900 via-cacao-900/80 to-transparent"></div>
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block bg-white/10 text-gold-400 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border border-gold-500/30 mb-5">
              {content.heroEyebrow}
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-white">
              {content.heroTitle}
            </h1>
            <p className="text-cream-50 mt-5 max-w-md leading-relaxed text-lg">
              {content.heroSubtitle}
            </p>
            <div className="flex gap-3 mt-8">
              <Link to="/toko" className="bg-gold-500 text-cacao-900 font-bold px-8 py-3.5 rounded-full flex items-center gap-2 hover:bg-gold-400 transition-colors">
                Belanja Sekarang <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-10 grid sm:grid-cols-3 gap-6">
        {[
          { icon: Leaf, title: 'Tanpa Pengawet', desc: 'Bahan alami, diproses dalam batch kecil.' },
          { icon: Truck, title: 'Pengiriman Cepat', desc: 'Dikirim ke seluruh Indonesia 1-3 hari.' },
          { icon: ShieldCheck, title: 'Kualitas Terjamin', desc: 'Setiap batch melalui uji rasa ketat.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center shrink-0">
              <Icon size={18} className="text-cacao-800" />
            </div>
            <div>
              <h4 className="font-bold text-sm">{title}</h4>
              <p className="text-xs text-cacao-600 mt-1">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
          <h2 className="text-2xl font-extrabold mb-6">Belanja per Kategori</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c) => {
              return (
                <Link
                  key={c.name}
                  to={`/toko?category=${encodeURIComponent(c.name)}`}
                  className="group relative overflow-hidden bg-cream-200 border border-cream-300 rounded-xl h-32 flex items-center justify-center hover:border-gold-500 transition-all shadow-sm hover:shadow-md"
                >
                  {c.image && (
                    <div className="absolute inset-0 z-0">
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                  )}
                  <span className="relative z-10 text-lg font-bold text-center px-4" style={{ color: c.textColor }}>{c.name}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Promo */}
      {onSale.length > 0 && (
        <section className="bg-cacao-900 py-14">
          <div className="max-w-7xl mx-auto px-5 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Sedang Diskon</h2>
                <p className="text-sm text-cream-300 mt-1">Jangan sampai kehabisan.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {onSale.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-10 mt-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold">Produk Pilihan</h2>
            <p className="text-sm text-cacao-600 mt-1">Rating tertinggi dari pelanggan kami.</p>
          </div>
          <Link to="/toko" className="text-sm font-semibold text-gold-600 hover:underline hidden sm:block">
            Lihat semua
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

    </div>
  )
}
