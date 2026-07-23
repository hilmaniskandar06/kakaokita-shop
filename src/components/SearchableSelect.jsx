import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'

export default function SearchableSelect({
  label,
  displayValue,
  options,
  onSelect,
  placeholder = 'Pilih...',
  disabled = false,
  loading = false,
  required = false,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="relative" ref={ref}>
      {label && <label className="block text-xs font-medium text-cacao-600 mb-1.5">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-cream-100 border border-cream-300 rounded-lg px-3.5 py-2.5 text-sm text-left disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={displayValue ? 'text-cacao-900 truncate' : 'text-cacao-400 truncate'}>
          {displayValue || placeholder}
        </span>
        <ChevronDown size={14} className="shrink-0 ml-2 text-cacao-500" />
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-cream-300 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          <div className="p-2 sticky top-0 bg-white border-b border-cream-200 flex items-center gap-2">
            <Search size={13} className="text-cacao-400 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik untuk mencari..."
              className="w-full text-sm outline-none"
            />
          </div>
          {loading ? (
            <div className="px-3 py-3 text-xs text-cacao-500">Memuat...</div>
          ) : filtered.length === 0 ? (
            <div className="px-3 py-3 text-xs text-cacao-500">Tidak ditemukan</div>
          ) : (
            filtered.map((o) => (
              <button
                type="button"
                key={o.id}
                onClick={() => {
                  onSelect(o)
                  setOpen(false)
                  setQuery('')
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-cream-100 transition-colors"
              >
                {o.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
