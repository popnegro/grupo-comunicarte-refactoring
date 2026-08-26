import { Mail, MapPin } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';
import { ContactForm } from '../components/contact/ContactForm';

export default function Contacto() {
  const [searchParams] = useSearchParams();
  const isMediaKit = searchParams.get('origen') === 'mediakit';

  return (
    <section className="flex-1 bg-[#F9F9F9]">
      <div className="bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">{isMediaKit ? 'Media Kit' : 'Contacto'}</p>
          <h1 className="mt-4 max-w-4xl text-4xl md:text-6xl font-semibold tracking-tight">{isMediaKit ? 'Tu selección, lista para avanzar.' : 'Hablemos de tu próxima campaña.'}</h1>
          <p className="mt-6 max-w-2xl text-lg md:text-xl text-gray-300 leading-relaxed">{isMediaKit ? 'Completá tus datos y recibí la propuesta consolidada de los soportes que seleccionaste.' : 'Contanos qué necesitás comunicar y te ayudamos a encontrar la solución OOH o DOOH adecuada.'}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
          <ContactForm isMediaKit={isMediaKit} />
          <aside className="space-y-4">
            <a href="mailto:ventas@grupocomunicarte.com" className="block rounded-2xl border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
              <Mail className="h-5 w-5" aria-hidden="true" />
              <h2 className="mt-4 text-base font-semibold">Email</h2>
              <p className="mt-1 text-sm text-gray-500">ventas@grupocomunicarte.com</p>
            </a>
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <MapPin className="h-5 w-5" aria-hidden="true" />
              <h2 className="mt-4 text-base font-semibold">Mendoza · Buenos Aires</h2>
              <p className="mt-1 text-sm text-gray-500">Atención comercial para campañas OOH y DOOH.</p>
            </div>
            <Link to="/inventario" className={buttonStyles({ variant: 'outline', className: 'w-full rounded-full' })}>Volver al inventario</Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
