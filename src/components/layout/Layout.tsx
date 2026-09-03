import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { cn } from '../../lib/utils';
import { buttonStyles } from '../ui/Button';
import { useSelection } from '../../context/SelectionContext';

export function Layout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { selectedCount } = useSelection();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Soportes', path: '/soportes' },
    { name: 'Soluciones', path: '/soluciones' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Inventario', path: '/inventario' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const ctaPath = '/contacto?origen=mediakit';

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden bg-[#F9F9F9]">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-2">
              <img src="/brand/brand-dark.webp" alt="Grupo Comunicarte" className="w-full max-w-[240px] aspect-[4/1] object-contain" />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className={cn('text-sm font-medium transition-colors hover:text-black', isActive(link.path) ? 'text-black font-semibold' : 'text-gray-500')}>
                  {link.name}
                </Link>
              ))}
              <div className="h-4 w-px bg-gray-200" />
              <Link to={ctaPath} className={buttonStyles({ size: 'sm' })}>
                <span>Media Kit</span>
                {selectedCount > 0 && <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">{selectedCount}</span>}
              </Link>
            </nav>
            <button className="md:hidden p-2 -mr-2 text-gray-900" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={isMobileMenuOpen}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 py-4 px-4 space-y-3 shadow-lg absolute w-full left-0">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={cn('block px-3 py-2 text-base font-medium rounded-xl', isActive(link.path) ? 'text-black bg-gray-50 font-semibold' : 'text-gray-600 hover:bg-gray-50')}>
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-bold border border-emerald-200/80">
                <span>Acceso Portal Admin</span><span className="w-2 h-2 rounded-full bg-emerald-500" />
              </Link>
              <Link to={ctaPath} onClick={() => setIsMobileMenuOpen(false)} className={buttonStyles({ className: 'w-full' })}>
                Media Kit{selectedCount > 0 && <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">{selectedCount}</span>}
              </Link>
            </div>
          </div>
        )}
      </header>
      <main className="flex-grow flex flex-col">{children}</main>
      <footer id="site-footer" className="bg-gray-950 text-white border-t border-gray-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="max-w-sm"><img src="/brand/brand-light.svg" alt="Grupo Comunicarte" className="w-[200px] mb-0" /></div>
            <nav className="flex flex-wrap gap-x-8 gap-y-3 content-start" aria-label="Navegación del pie de página">
              {navLinks.map((link) => <Link key={link.path} to={link.path} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">{link.name}</Link>)}
              <Link to="/contacto" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Contacto</Link>
            </nav>
          </div>
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start gap-4 text-xs text-gray-500">
            <span>© 2026 Todos los derechos reservados.</span>
            <span><a href="https://wa.me/5492616706710" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white">Powered by SmartWeb</a></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
