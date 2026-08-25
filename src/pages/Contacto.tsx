import { Mail, MessageCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';

export default function Contacto() {
  return (
    <section className="flex-1 bg-[#F9F9F9]">
      <div className="bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Contacto</p>
          <h1 className="mt-4 max-w-4xl text-4xl md:text-6xl font-semibold tracking-tight">Hablemos de tu próxima campaña.</h1>
          <p className="mt-6 max-w-2xl text-lg md:text-xl text-gray-300 leading-relaxed">Contanos qué necesitás comunicar y te ayudamos a encontrar la solución OOH o DOOH adecuada.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <a href="mailto:ventas@grupocomunicarte.com" className="rounded-2xl border border-gray-200 bg-white p-7 hover:border-gray-300 hover:shadow-sm transition-all">
            <Mail className="h-6 w-6" aria-hidden="true" />
            <h2 className="mt-5 text-lg font-semibold">Email</h2>
            <p className="mt-2 text-sm text-gray-500">ventas@grupocomunicarte.com</p>
          </a>
          <div className="rounded-2xl border border-gray-200 bg-white p-7">
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
            <h2 className="mt-5 text-lg font-semibold">WhatsApp</h2>
            <p className="mt-2 text-sm text-gray-500">Canal comercial próximamente disponible.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-7">
            <MapPin className="h-6 w-6" aria-hidden="true" />
            <h2 className="mt-5 text-lg font-semibold">Mendoza</h2>
            <p className="mt-2 text-sm text-gray-500">Atención comercial en Mendoza y Buenos Aires.</p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <a href="mailto:ventas@grupocomunicarte.com" className={buttonStyles({ className: 'rounded-full px-6' })}>Escribir al equipo</a>
          <Link to="/inventario" className={buttonStyles({ variant: 'outline', className: 'rounded-full px-6' })}>Ver inventario</Link>
        </div>
      </div>
    </section>
  );
}
