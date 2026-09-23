import { Mail, MapPin } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';
import { ContactForm } from '../components/contact/ContactForm';
import { InteriorHero } from '../components/layout/InteriorHero';

export default function Contacto() {
  const [searchParams] = useSearchParams();
  const isMediaKit = searchParams.get('origen') === 'mediakit';

  return (
    <section className="flex-1 bg-[#F9F9F9]">
      <InteriorHero
        eyebrow={isMediaKit ? 'Media Kit' : 'Contacto'}
        title={isMediaKit ? 'Tu selección, lista para avanzar.' : 'Hablemos de tu próxima campaña.'}
        description={isMediaKit ? 'Este es el cierre de tu selección: completá tus datos y enviá la solicitud para que el equipo comercial prepare tu propuesta.' : 'Contanos qué necesitás comunicar y te ayudamos a encontrar la solución OOH o DOOH adecuada.'}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
          <ContactForm isMediaKit={isMediaKit} />
          <aside className="space-y-4">
            {isMediaKit && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Cierre de solicitud</p>
                <h2 className="mt-2 text-lg font-semibold text-gray-950">No perdés tu selección</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">Los soportes que elegiste se envían junto con tus datos. No necesitás volver al inventario.</p>
              </div>
            )}
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
