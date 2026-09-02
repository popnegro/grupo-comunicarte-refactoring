import { Mail, MapPin, PhoneCallIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ContactForm } from '../components/contact/ContactForm';
import { InteriorHero } from '../components/layout/InteriorHero';

export default function Contacto() {
  const [searchParams] = useSearchParams();
  const isMediaKit = searchParams.get('origen') === 'mediakit';

  return (
    <section className="flex-1 flex-col bg-[#F9F9F9]">
      <InteriorHero
        eyebrow={isMediaKit ? 'Media Kit' : 'Contacto'}
        title="Solicitá tu propuesta personalizada"
        description="Completá tus datos y te enviamos la cotización de los soportes seleccionados."
        align="center"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
          <ContactForm isMediaKit={isMediaKit} />
          <aside className="space-y-4">
            <a href="mailto:comercial@grupocomunicarte.com.ar" className="block rounded-2xl border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
              <Mail className="h-5 w-5" aria-hidden="true" />
              <h2 className="mt-4 text-base font-semibold">Email</h2>
              <p className="mt-1 text-sm text-gray-500">comercial@grupocomunicarte.com.ar</p>
            </a>
            <a href="https://maps.app.goo.gl/V3uZwDq283b1u6UY8" className="block rounded-2xl border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
              <MapPin className="h-5 w-5" aria-hidden="true" />
              <h2 className="mt-4 text-base font-semibold">Oficina Comercial</h2>
              <p className="mt-1 text-sm text-gray-500">9 de Julio 891, M5501 Godoy Cruz, Mendoza</p>
            </a>
            <a href="https://wa.me/542615830208" className="block rounded-2xl border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
              <PhoneCallIcon className="h-5 w-5" aria-hidden="true" />
              <h2 className="mt-4 text-base font-semibold">WhatsApp</h2>
              <p className="mt-1 text-sm text-gray-500">+54 261 583 0208</p>
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
