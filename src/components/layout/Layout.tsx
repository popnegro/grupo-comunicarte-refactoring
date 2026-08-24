import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { buttonStyles } from '../ui/Button';

export function Layout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Soportes', path: '/soportes' },
    { name: 'Soluciones', path: '/soluciones' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Inventario', path: '/inventario' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden bg-[#F9F9F9]">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center shrink-0" aria-label="Grupo Comunicarte — Inicio">
              <img src="/brand/brand-dark.webp" alt="Grupo Comunicarte" className="w-[190px] sm:w-[220px] h-auto object-contain" />
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
                      ? 'text-gray-950 after:bg-red-600 after:scale-x-100'
                      : 'text-gray-500 hover:text-gray-950 after:bg-gray-950 after:scale-x-0 hover:after:scale-x-100'
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-6 w-px bg-gray-200 mx-3" aria-hidden="true" />
              <a
                href="mailto:ventas@grupocomunicarte.com"
                className={buttonStyles({ size: 'sm', className: 'rounded-full px-5' })}
              >
                Contacto
              </a>
            </nav>

            <button
              className="md:hidden p-2.5 -mr-2 text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0" role="navigation" aria-label="Navegación móvil">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 text-base font-semibold rounded-xl transition-colors',
                    isActive(link.path)
                      ? 'text-gray-950 bg-gray-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
                  )}
                >
                  {link.name}
                  {isActive(link.path) && <span className="w-1.5 h-1.5 rounded-full bg-red-600" aria-hidden="true" />}
                </Link>
              ))}
              <div className="pt-3 mt-2 border-t border-gray-100">
                <a
                  href="mailto:ventas@grupocomunicarte.com"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={buttonStyles({ className: 'w-full rounded-xl' })}
                >
                  Hablar con el equipo
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow flex flex-col">{children}</main>

      <footer className="bg-gray-950 text-white border-t border-gray-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col md:flex-row justify-between gap-10">
            <div className="max-w-sm">
              <img src="/brand/brand-dark.webp" alt="Grupo Comunicarte" className="w-[190px] brightness-0 invert mb-5" />
              <p className="text-sm text-gray-400 leading-relaxed">
                Soluciones de publicidad exterior OOH y DOOH para conectar marcas con audiencias en movimiento.
              </p>
              <p className="text-xs text-gray-500 mt-5">Mendoza • Buenos Aires</p>
            </div>

            <nav className="flex flex-wrap gap-x-8 gap-y-3 content-start" aria-label="Navegación del pie de página">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  {link.name}
                </Link>
              ))}
              <a href="mailto:ventas@grupocomunicarte.com" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Contacto
              </a>
            </nav>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-xs text-gray-500">
            <span>Grupo Comunicarte</span>
            <span>Publicidad que se ve. Resultados que se miden.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
