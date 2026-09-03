import { ArrowRight, MapPin, MonitorPlay, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';
import { InteriorHero } from '../components/layout/InteriorHero';

export default function Soportes() {
  const soportes = [
    {
      id: 'tradicional',
      name: 'Vía Pública Tradicional',
      eyebrow: 'OOH · Cobertura',
      icon: MapPin,
      description: 'Presencia masiva y permanente en accesos estratégicos. Ideal para campañas de branding que buscan recordación constante 24/7.',
      features: ['Gigantografías en rutas y accesos principales', 'Impacto continuo de alta recordación', 'Soportes iluminados de gran escala', 'Cobertura urbana en Mendoza y Buenos Aires'],
      link: '/inventario?tipo=tradicional',
      image: '/images/soportes-tradicionales-mendoza.webp',
    },
    {
      id: 'led',
      name: 'Pantallas LED (DOOH)',
      eyebrow: 'DOOH · Dinámico',
      icon: MonitorPlay,
      description: 'Flexibilidad y dinamismo para adaptar tu mensaje al instante. Perfecto para promociones temporales, ofertas rotativas y lanzamientos inmediatos.',
      features: ['Contenido dinámico en alta definición', 'Actualización de pauta en tiempo real', 'Ubicaciones en los nudos viales más transitados', 'Flexibilidad de formatos y segmentación temporal'],
      link: '/inventario?tipo=led',
      image: '/images/pantallas-led-mendoza.webp',
    },
    {
      id: 'led_movil',
      name: 'Camión LED Móvil',
      eyebrow: 'DOOH · En movimiento',
      icon: Truck,
      description: 'Publicidad itinerante que acerca tu marca directo a la gente. Diseñado para eventos masivos, activaciones locales y recorridos de alto impacto.',
      features: ['Recorridos programados y personalizados', 'Pantallas LED gigantes a nivel de calle', 'Ideal para activaciones de marca y eventos', 'Alcance directo al consumidor en vía pública'],
      link: '/inventario?tipo=led_movil',
      image: '/images/led-movil-mendoza.webp',
    },
  ];

  return (
    <div className="flex flex-col w-full bg-white">
      <InteriorHero
        eyebrow="Ecosistema de medios"
        title="Nuestros soportes"
        description="Combinamos la presencia del formato tradicional con la versatilidad digital para maximizar el alcance de tu marca."
        align="left"
        actions={
          <>
            <Link to="/inventario" className={buttonStyles({ className: 'rounded-lg px-5' })}>
              Explorar inventario <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contacto" className={buttonStyles({ variant: 'outline', className: 'rounded-lg px-5' })}>
              Hablar con Ventas
            </Link>
          </>
        }
      />

      <section className="bg-[#F9F9F9] px-4 py-12 sm:px-6 lg:px-8 md:py-16">
        <div className="mx-auto max-w-7xl space-y-4">
          {soportes.map((soporte) => {
            const Icon = soporte.icon;
            return (
              <article key={soporte.id} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors hover:border-gray-300">
                <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="relative min-h-[260px] overflow-hidden bg-gray-100 lg:min-h-[360px]">
                    <img src={soporte.image} alt={soporte.name} className="h-full w-full object-cover" />
                  </div>

                  <div className="flex flex-col justify-between p-6 md:p-8 lg:p-9">
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-950 text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">{soporte.eyebrow}</span>
                      </div>
                      <h2 className="mt-7 text-2xl font-bold tracking-[-0.03em] text-gray-950 md:text-3xl">{soporte.name}</h2>
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-600 md:text-base">{soporte.description}</p>

                      <div className="mt-6 grid gap-2 sm:grid-cols-2">
                        {soporte.features.map((feature) => (
                          <div key={feature} className="border-l-2 border-gray-200 py-1 pl-3 text-sm leading-relaxed text-gray-700">
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link to={soporte.link} className={buttonStyles({ variant: 'ghost', className: 'mt-7 w-fit px-0 font-semibold text-gray-900 hover:bg-transparent hover:text-brand-emerald' })}>
                      Ver soportes disponibles <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
