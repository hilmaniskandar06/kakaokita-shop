// siteContentService.js — mengelola teks-teks utama situs (hero, footer, newsletter)
// agar bisa diubah dari halaman admin tanpa mengedit kode.

const STORAGE_KEY = 'kk_site_content'
const DELAY = 100

export const DEFAULT_CONTENT = {
  heroEyebrow: '100% Kakao Asli Nusantara',
  heroTitle: 'Cokelat yang dibuat dengan niat, bukan cuma resep.',
  heroSubtitle: 'Setiap batang lahir dari biji kakao petani lokal, dipanggang perlahan, lalu dituang dengan tangan. Tidak ada jalan pintas — hanya rasa yang jujur.',
  footerDescription: 'Cokelat artisan dari biji kakao petani Nusantara, diproses dalam batch kecil.',
  footerEmail: 'hello@kakaokita.id',
  footerAddress: 'Bandung, Indonesia',
  shippingFee: 15000,
  serviceFee: 0,
  heroMedia: '',
  heroMediaType: 'image',
  shopName: 'Kakao Kita',
  shopLogo: '',
  socialInstagram: 'https://instagram.com/kakaokita',
  socialFacebook: '',
  socialTiktok: '',
  socialTwitter: '',
  pageAbout: '<p>Cerita tentang Kakao Kita...</p>',
  pageFaq: '<h2>Tanya Jawab</h2>',
  pageTos: '<p>Syarat dan Ketentuan layanan Kakao Kita.</p>',
  pageRefund: '<p>Kebijakan pengembalian dana.</p>',
  pagePrivacy: '<p>Kebijakan privasi.</p>',
  pageCookie: '<p>Kebijakan penggunaan cookie.</p>',
}

function delay(v) {
  return new Promise((resolve) => setTimeout(() => resolve(v), DELAY))
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_CONTENT, ...JSON.parse(raw) }
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONTENT))
  return DEFAULT_CONTENT
}

export async function getContent() {
  return delay(read())
}

export async function updateContent(partial) {
  const next = { ...read(), ...partial }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return delay(next)
}
