import { ChevronRight, Home, MapPin, Send, Sparkles, Users, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

interface MobileMenuProps { open: boolean; onClose: () => void; onSearch: () => void; }

const links = [
  { name: 'Inicio', path: '/', icon: Home, sub: 'Conocé Grupo Comunicarte' },
  { name: 'Inventario', path: '/inventario', icon: MapPin, sub: 'Explorá soportes disponibles' },
  { name: 'Servicios', path: '/soluciones', icon: Sparkles, sub: 'Soluciones y formatos para tu campaña' },
  { name: 'Nosotros', path: '/nosotros', icon: Users, sub: 'La empresa y su experiencia' },
];

export function MobileMenu({ open, onClose, onSearch }: MobileMenuProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="md:hidden fixed inset-0 z-[3000]">
      <button className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs" onClick={onClose} aria-label="Cerrar menú" />
      <div className="absolute inset-x-0 top-20 bottom-0 overflow-y-auto bg-white/95 backdrop-blur-xl">
        <div className="space-y-3 p-4">
          <button onClick={onSearch} className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 text-left">
            <Search className="h-5 w-5 text-zinc-400" />
            <span className="text-sm font-semibold text-zinc-900">BUSCAR</span>
          </button>
          <nav className="overflow-hidden rounded-2xl border border-zinc-200 bg-white" aria-label="Navegación principal">
            {links.map(({ name, path, icon: Icon }) => (
              <Link key={path} to={path} onClick={onClose} className="flex items-center gap-3 border-b border-zinc-100 px-4 py-4 last:border-0">
                <Icon className="h-5 w-5 text-zinc-500" />
                <span className="min-w-0 flex-1 text-sm font-semibold">{name}</span>
                <ChevronRight className="h-4 w-4 text-zinc-300" />
              </Link>
            ))}
          </nav>
          <Link to="/contacto" onClick={onClose} className="flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white">Solicitar propuesta <Send className="h-4 w-4" /></Link>
        </div>
      </div>
    </div>
  );
}
