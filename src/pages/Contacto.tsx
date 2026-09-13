import { Mail, MapPin, PhoneCallIcon } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ContactForm } from '../components/contact/ContactForm';
import { InteriorHero } from '../components/layout/InteriorHero';
import { buttonStyles } from '../components/ui/Button';

export default function Contacto() {
  const [searchParams] = useSearchParams();
  const isMediaKit = searchParams.get('origen') === 'mediakit';

  return (
    <main className="flex flex-1 flex-col bg-[#F9F9F9]">
      <InteriorHero
        eyebrow={isMediaKit ? 'Media Kit' : 'Contacto'}
        title="Solicitá tu propuesta personalizada"
        description="Completá tus datos y te enviamos la cotización de los soportes seleccionados."
        actions={<Link to="/inventario" className={buttonStyles({ variant: 'outline' })}>Volver al inventario</Link>}
      />

      <div className="page-container py-12 md:py-16">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <ContactForm isMediaKit={isMediaKit} />
          <aside className="grid gap-3">
            <a href="mailto:comercial@grupocomunicarte.com.ar" className="surface-card block p-5 transition-colors hover:border-gray-300">
              <Mail className="h-5 w-5 text-gray-700" aria-hidden="true" />
              <h2 className="text-card-title mt-3 text-base">Email</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">comercial@grupocomunicarte.com.ar</p>
            </a>
            <a href="https://maps.app.goo.gl/V3uZwDq283b1u6UY8" className="surface-card block p-5 transition-colors hover:border-gray-300">
              <MapPin className="h-5 w-5 text-gray-700" aria-hidden="true" />
              <h2 className="text-card-title mt-3 text-base">Oficina Comercial</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">9 de Julio 891, M5501 Godoy Cruz, Mendoza</p>
            </a>
            <a href="https://wa.me/542615830208" className="surface-card block p-5 transition-colors hover:border-gray-300">
              <PhoneCallIcon className="h-5 w-5 text-gray-700" aria-hidden="true" />
              <h2 className="text-card-title mt-3 text-base">WhatsApp</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">+54 261 583 0208</p>
            </a>
          </aside>
        </div>
      </div>
    </main>
  );
}
