import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, MapPin, Tv } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../hooks/useInventory';

interface SearchModalProps { open: boolean; onClose: () => void; }

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { items } = useInventory();

  useEffect(() => {
    if (open) { setQuery(''); requestAnimationFrame(() => inputRef.current?.focus()); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 8);
    return items.filter(item =>
      [item.name, item.canonical_id, 'address' in item ? item.address : '', item.tipo_soporte, item.ciudad]
        .some(value => String(value || '').toLowerCase().includes(q))
    ).slice(0, 10);
  }, [items, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[4000]" role="dialog" aria-modal="true" aria-label="Buscar soporte">
      <button className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm" onClick={onClose} aria-label="Cerrar búsqueda" />
      <div className="relative mx-auto mt-[10vh] w-[min(680px,calc(100%-2rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-zinc-200 px-4">
          <Search className="h-5 w-5 text-zinc-400" aria-hidden="true" />
          <input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)}
            placeholder="Buscar soporte, código, dirección o tipo..."
            className="h-14 flex-1 bg-transparent text-sm outline-none" />
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-zinc-100" aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length ? results.map(item => (
            <button key={item.canonical_id}
              onClick={() => { navigate('/inventario?soporte=' + encodeURIComponent(item.canonical_id)); onClose(); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-zinc-50">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100"><Tv className="h-4 w-4 text-zinc-600" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-zinc-950">{item.name}</span>
                <span className="flex items-center gap-1 truncate text-xs text-zinc-500"><MapPin className="h-3 w-3" />{'address' in item ? item.address : item.ciudad || item.tipo_soporte}</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400">{item.canonical_id}</span>
            </button>
          )) : <p className="px-4 py-10 text-center text-sm text-zinc-500">No encontramos soportes con esa búsqueda.</p>}
        </div>
        <div className="border-t border-zinc-100 px-4 py-3 text-[11px] text-zinc-400">Esc para cerrar · Ctrl/⌘ K para buscar</div>
      </div>
    </div>
  );
}
