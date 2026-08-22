import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
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

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      <header className="sticky top-0 z-0 w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-2">
              <img src="/brand/brand-dark.webp" alt="Grupo Comunicarte" className="w-full max-w-[240px] aspect-[4/1] object-contain" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-black", 
                      isActive ? "text-black font-semibold" : "text-gray-500"
                    )}
                  >
                    {link.name}
                  </Link>
                )
              })}
              <div className="h-4 w-px bg-gray-200" />
              <a href="mailto:ventas@grupocomunicarte.com" className={buttonStyles({ size: "sm" })}>
                Contacto
              </a>
            </nav>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 -mr-2 text-gray-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 py-4 px-4 space-y-3 shadow-lg absolute w-full left-0">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.path}
                  to={link.path} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2 text-base font-medium rounded-xl", 
                    isActive ? "text-black bg-gray-50 font-semibold" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {link.name}
                </Link>
              )
            })}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-bold border border-emerald-200/80"
              >
                <span>Acceso Portal Admin</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </Link>
              <a href="mailto:ventas@grupocomunicarte.com" className={buttonStyles({ className: "w-full" })}>
                Contacto
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow flex flex-col">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            
            <p className="text-gray-500 text-sm">
              Mendoza • Buenos Aires
            </p>
          </div>
          
          <nav className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="text-sm font-medium text-gray-500 hover:text-black">
                {link.name}
              </Link>
            ))}
            <a href="mailto:ventas@grupocomunicarte.com" className="text-sm font-medium text-gray-500 hover:text-black">
              Contacto
            </a>
            <Link to="/dashboard" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition-colors">
              Portal Admin
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
