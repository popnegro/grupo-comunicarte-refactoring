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
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center shrink-0" aria-label="Grupo Comunicarte — Inicio">
              <img src="/brand/brand-dark.webp" alt="Grupo Comunicarte" className="w-[180px] sm:w-[205px] h-auto object-contain" />
            </Link>

            <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'relative px-3 py-2 text-sm font-semibold rounded-lg transition-colors',
                    'after:absolute after:left-3 after:right-3 after:-bottom-[1px] after:h-0.5 after:rounded-full after:transition-transform after:origin-center',
                    isActive(link.path)
                      ? 'text-gray-950 after:bg-brand-emerald after:scale-x-100'
                      : 'text-gray-500 hover:text-gray-950 after:bg-gray-950 after:scale-x-0 hover:after:scale-x-100'
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-5 w-px bg-gray-200 mx-2" aria-hidden="true" />
              <Link
                to={ctaPath}
                className={buttonStyles({ size: 'sm', className: 'rounded-lg px-4 inline-flex items-center gap-2' })}
              >
                {selectedCount > 0 && <ShoppingBag className="h-4 w-4" aria-hidden="true" />}
                <span>Media Kit</span>
                {selectedCount > 0 && (
                  <span
                    className="min-w-5 h-5 px-1 rounded-md bg-white/20 text-xs font-bold inline-flex items-center justify-center"
                    aria-label={`${selectedCount} soportes seleccionados`}
                  >
                    {selectedCount}
                  </span>
                )}
              </Link>
            </nav>

            <button
              className="md:hidden p-2 text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0" role="navigation" aria-label="Navegación móvil">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors',
                    isActive(link.path) ? 'text-gray-950 bg-gray-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
                  )}
                >
                  {link.name}
                  {isActive(link.path) && <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" aria-hidden="true" />}
                </Link>
              ))}
              <div className="pt-3 mt-2 border-t border-gray-100">
                <Link
                  to={ctaPath}
                  onClick={closeMobileMenu}
                  className={buttonStyles({ className: 'w-full rounded-lg inline-flex items-center justify-center gap-2' })}
                >
                  {selectedCount > 0 && <ShoppingBag className="h-4 w-4" aria-hidden="true" />}
                  <span>Media Kit</span>
                  {selectedCount > 0 && <span className="min-w-5 h-5 px-1 rounded-md bg-white/20 text-xs font-bold inline-flex items-center justify-center">{selectedCount}</span>}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow flex flex-col">{children}</main>

      <footer id="site-footer" className="bg-gray-950 text-white border-t border-gray-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="max-w-sm">
              <img src="/brand/brand-light.svg" alt="Grupo Comunicarte" className="w-[200px] mb-0" />
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-3 content-start" aria-label="Navegación del pie de página">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  {link.name}
                </Link>
              ))}
              <Link to="/contacto" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Contacto
              </Link>
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
