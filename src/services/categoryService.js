// categoryService.js — sama pola dengan productService.js: async, localStorage,
// gampang diganti ke Supabase nanti (tabel `categories` dengan kolom id, name).

import { SEED_CATEGORIES } from '../data/products'

const STORAGE_KEY = 'kk_categories'
const DELAY = 100

function delay(v) {
  return new Promise((resolve) => setTimeout(() => resolve(v), DELAY))
}

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Migrate old array of strings to objects
      if (parsed.length > 0 && typeof parsed[0] === 'string') {
        const migrated = parsed.map(c => ({ name: c, image: '', textColor: '#ffffff' }))
        writeAll(migrated)
        return migrated
      }
      return parsed
    }
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CATEGORIES))
  return SEED_CATEGORIES
}

function writeAll(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export async function listCategories() {
  return delay(readAll())
}

export async function addCategory(categoryObj) {
  const list = readAll()
  if (list.some((c) => c.name.toLowerCase() === categoryObj.name.toLowerCase())) {
    throw new Error('Kategori ini sudah ada')
  }
  const next = [...list, categoryObj]
  writeAll(next)
  return delay(next)
}

export async function updateCategory(oldName, updatedObj) {
  const list = readAll()
  const next = list.map(c => c.name === oldName ? updatedObj : c)
  writeAll(next)
  return delay(next)
}

export async function deleteCategory(name) {
  const next = readAll().filter((c) => c.name !== name)
  writeAll(next)
  return delay(next)
}
