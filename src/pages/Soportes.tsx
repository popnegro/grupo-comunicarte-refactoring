import { ArrowRight, MapPin, MonitorPlay, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';

export default function Soportes() {
  const soportes = [
    {
      id: 'tradicional',
      name: 'Vía Pública Tradicional',
      eyebrow: 'OOH · Cobertura',
      icon: MapPin,
      description: 'Cobertura masiva con ubicaciones estratégicas de alto tránsito en Mendoza y Buenos Aires.',
      features: ['Cartelería espectacular y gigantografías', 'Séxtuples y mobiliario urbano', 'Puntos de ingreso a la ciudad y rutas principales', 'Iluminación Frontlight para impacto nocturno'],
      link: '/inventario?tipo=tradicional',
      image: '/images/mza-trad-01.jpg'
    },
    {
      id: 'led',
      name: 'Pantallas LED (DOOH)',
      eyebrow: 'DOOH · Dinámico',
      icon: MonitorPlay,
      description: 'Soportes digitales de alta resolución en puntos neurálgicos de concentración comercial.',
      features: ['Tecnología LED P4 y P6 de alta definición', 'Formatos dinámicos y rotativos', 'Contenidos flexibles y actualización en tiempo real', 'Ubicaciones premium en nudos viales y centros comerciales'],
      link: '/inventario?tipo=led',
      image: '/images/mza-led-01.jpg'
    },
    {
      id: 'led_movil',
      name: 'Camión LED Móvil',
      eyebrow: 'DOOH · En movimiento',
      icon: Truck,
      description: 'Impacto en movimiento. Llevamos tu mensaje directamente a donde está tu audiencia.',
      features: ['Pantallas LED laterales de 4x2m', 'Rutas estratégicas programables', 'Activaciones de marca y eventos', 'Alta visibilidad a nivel peatonal y vehicular'],
      link: '/inventario?tipo=led_movil',
      image: '/images/led-movil-feature.webp'
    }
  ];

  return (
    <div className="flex flex-col w-full bg-white">
      <section className="relative overflow-hidden bg-white px-4 pb-20 pt-24 sm:px-6 lg:px-8 md:pb-28 md:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[min(760px,90vw)] -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-eyebrow mb-4">Ecosistema de medios</p>
            <h1 className="text-5xl font-bold tracking-[-0.04em] text-gray-950 sm:text-6xl md:text-7xl">Nuestros soportes</h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">Combinamos la presencia ineludible del formato tradicional con la versatilidad de la era digital para maximizar el alcance de tu marca.</p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8 md:pb-32">
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

      <section className="border-t border-gray-200 bg-white px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-eyebrow mb-4">El próximo punto de contacto</p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-950 md:text-5xl">Encontrá el soporte adecuado para tu marca</h2>
          <p className="mx-auto mb-9 mt-5 max-w-2xl leading-relaxed text-gray-500">Explorá nuestra cobertura y descubrí dónde tu próxima campaña puede generar mayor impacto.</p>
          <Link to="/soportes" className={buttonStyles({ size: 'lg', className: 'inline-flex rounded-full px-7' })}>Ver soportes <ArrowRight className="h-5 w-5" /></Link>
        </div>
      </section>
    </div>
  );
}
