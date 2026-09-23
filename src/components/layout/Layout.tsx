import { ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  const footerLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Inventario', path: '/inventario' },
    { name: 'Soportes', path: '/soportes' },
    { name: 'Soluciones', path: '/soluciones' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Contacto', path: '/contacto' },
  ];

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden bg-[#F9F9F9]">
      <Navbar />
      <main className="flex-grow flex flex-col">{children}</main>
      <footer id="site-footer" className="bg-gray-950 text-white border-t border-gray-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="max-w-sm"><img src="/brand/brand-light.svg" alt="Grupo Comunicarte" className="w-[200px]" /></div>
            <nav className="flex flex-wrap gap-x-8 gap-y-3 content-start" aria-label="Navegación del pie de página">
              {footerLinks.map(link => <Link key={link.path} to={link.path} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">{link.name}</Link>)}
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
