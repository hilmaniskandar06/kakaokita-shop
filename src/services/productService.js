// productService.js — versi SEDERHANA (localStorage, tanpa server).
//
// Semua fungsi di sini sengaja dibuat `async` dan punya nama serta bentuk
// argumen yang SAMA dengan versi Supabase di `productService.supabase.example.js`.
// Tujuannya: kalau nanti pindah ke database sungguhan, kamu cukup mengganti
// isi file ini — tidak perlu mengubah halaman/komponen lain sama sekali,
// karena semua halaman hanya bicara lewat ProductsContext, bukan ke sini langsung.
//
// Lihat README bagian "Migrasi ke Supabase" untuk langkah lengkapnya.

import { SEED_PRODUCTS } from '../data/products'

const STORAGE_KEY = 'kk_products'
const SIMULATED_DELAY = 150 // ms — meniru jeda jaringan agar UI loading terasa wajar

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY))
}

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // localStorage rusak/tidak tersedia — jatuh ke seed
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PRODUCTS))
  return SEED_PRODUCTS
}

function writeAll(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export async function listProducts() {
  return delay(readAll())
}

export async function getProduct(id) {
  return delay(readAll().find((p) => p.id === id) || null)
}

export async function createProduct(payload) {
  const list = readAll()
  const id = payload.id || 'p' + Date.now()
  const product = { ...payload, id }
  writeAll([product, ...list])
  return delay(product)
}

export async function updateProduct(id, payload) {
  const list = readAll()
  const idx = list.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Produk tidak ditemukan')
  const updated = { ...list[idx], ...payload, id }
  list[idx] = updated
  writeAll(list)
  return delay(updated)
}

export async function deleteProduct(id) {
  writeAll(readAll().filter((p) => p.id !== id))
  return delay(true)
}

// Khusus versi sederhana: kembalikan data ke kondisi awal (tidak ada di versi Supabase).
export async function resetProducts() {
  writeAll(SEED_PRODUCTS)
  return delay(SEED_PRODUCTS)
}
