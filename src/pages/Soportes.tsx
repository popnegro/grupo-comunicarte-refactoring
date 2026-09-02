import { ArrowRight, MapPin, MonitorPlay, Truck, Sparkles } from 'lucide-react';
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
      image: '/images/soportes-tradicionales-mendoza.webp'
    },
    {
      id: 'led',
      name: 'Pantallas LED (DOOH)',
      eyebrow: 'DOOH · Dinámico',
      icon: MonitorPlay,
      description: 'Flexibilidad y dinamismo para adaptar tu mensaje al instante. Perfecto para promociones temporales, ofertas rotativas y lanzamientos inmediatos.',
      features: ['Contenido dinámico en alta definición', 'Actualización de pauta en tiempo real', 'Ubicaciones en los nudos viales más transitados', 'Flexibilidad de formatos y segmentación temporal'],
      link: '/inventario?tipo=led',
      image: '/images/pantallas-led-mendoza.webp'
    },
    {
      id: 'led_movil',
      name: 'Camión LED Móvil',
      eyebrow: 'DOOH · En movimiento',
      icon: Truck,
      description: 'Publicidad itinerante que acerca tu marca directo a la gente. Diseñado para eventos masivos, activaciones locales y recorridos de alto impacto.',
      features: ['Recorridos programados y personalizados', 'Pantallas LED gigantes a nivel de calle', 'Ideal para activaciones de marca y eventos', 'Alcance directo al consumidor en vía pública'],
      link: '/inventario?tipo=led_movil',
      image: '/images/led-movil-mendoza.webp'
    }
  ];

  return (
    <div className="flex flex-col w-full bg-white">
      <InteriorHero
        eyebrow="Ecosistema de medios"
        title="Nuestros soportes"
        description="Combinamos la presencia ineludible del formato tradicional con la versatilidad de la era digital para maximizar el alcance de tu marca."
        align='center'
      />

      <section className="bg-[#F9F9F9] px-4 py-24 sm:px-6 lg:px-8 md:py-32">
        <div className="mx-auto max-w-7xl space-y-6">
          {soportes.map((soporte, index) => {
            const Icon = soporte.icon;
            return (
              <article key={soporte.id} className="group overflow-hidden rounded-[2rem] border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-2xl">
                <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="relative min-h-[300px] overflow-hidden bg-gray-100 lg:min-h-[430px]">
                    <img src={soporte.image} alt={soporte.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                    <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">0{index + 1} · {soporte.eyebrow}</div>
                  </div>

                  <div className="flex flex-col justify-between p-7 md:p-10 lg:p-12">
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-sm">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Soporte</span>
                      </div>
                      <h2 className="mt-10 text-3xl font-bold tracking-[-0.03em] text-gray-950 md:text-4xl">{soporte.name}</h2>
                      <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg">{soporte.description}</p>

                      <div className="mt-8 grid gap-3 sm:grid-cols-2">
                        {soporte.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 transition-colors group-hover:bg-white">
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link to={soporte.link} className={buttonStyles({ className: 'mt-9 w-full justify-center rounded-full sm:w-fit' })}>
                      Explorar inventario <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-white px-4 py-24 sm:py-28 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full bg-gray-100 border border-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-red-600" /> Planificá tu pauta hoy
          </div>
          <h2 className="mb-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-950">
            Potenciá la comunicación de tu negocio
          </h2>
          <p className="mx-auto mb-10 max-w-2xl leading-relaxed text-gray-600 text-base sm:text-lg">
            Visualizá nuestras ubicaciones en tiempo real desde el mapa interactivo y seleccioná los formatos ideales para conectar con tus clientes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/soluciones"
              className={buttonStyles({
                size: 'lg',
                className: 'inline-flex rounded-full px-8 font-semibold shadow-md'
              })}
            >
              Conocer soluciones <ArrowRight className="h-5 w-5 ml-1" />
            </Link>
            <Link
              to="/contacto"
              className={buttonStyles({
                variant: 'outline',
                size: 'lg',
                className: 'inline-flex rounded-full px-8 font-semibold'
              })}
            >
              Hablar con Ventas
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
