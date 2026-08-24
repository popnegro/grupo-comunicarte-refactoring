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
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-950',
      iconBg: 'bg-white'
    },
    {
      id: 'led',
      name: 'Pantallas LED (DOOH)',
      eyebrow: 'DOOH · Dinámico',
      icon: MonitorPlay,
      description: 'Soportes digitales de alta resolución en puntos neurálgicos de concentración comercial.',
      features: ['Tecnología LED P4 y P6 de alta definición', 'Formatos dinámicos y rotativos', 'Contenidos flexibles y actualización en tiempo real', 'Ubicaciones premium en nudos viales y centros comerciales'],
      link: '/inventario?tipo=led',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      iconBg: 'bg-white'
    },
    {
      id: 'led_movil',
      name: 'Camión LED Móvil',
      eyebrow: 'DOOH · En movimiento',
      icon: Truck,
      description: 'Impacto en movimiento. Llevamos tu mensaje directamente a donde está tu audiencia.',
      features: ['Pantallas LED laterales de 4x2m', 'Rutas estratégicas programables', 'Activaciones de marca y eventos', 'Alta visibilidad a nivel peatonal y vehicular'],
      link: '/inventario?tipo=led_movil',
      bgColor: 'bg-gray-950',
      textColor: 'text-white',
      iconColor: 'text-white',
      iconBg: 'bg-white/10'
    }
  ];

  return (
    <div className="flex flex-col w-full bg-white">
      <section className="relative overflow-hidden bg-[#F9F9F9] border-b border-gray-200 px-4 py-24 sm:px-6 lg:px-8 md:py-28">
        <div className="absolute inset-0 bg-[url('/brand/pattern-light.webp')] bg-repeat opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-[#F9F9F9]" />
        <div className="relative max-w-7xl mx-auto z-10">
          <span className="inline-flex items-center gap-2 text-red-600 font-bold tracking-[0.16em] uppercase text-xs mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            Ecosistema de medios
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-950 tracking-[-0.035em] mb-6">Nuestros soportes</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl leading-relaxed">
            Combinamos la presencia ineludible del formato tradicional con la versatilidad de la era digital para maximizar el alcance de tu marca.
          </p>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto space-y-5">
          {soportes.map((soporte) => {
            const Icon = soporte.icon;
            const isDark = soporte.id === 'led_movil';
            return (
              <article key={soporte.id} className={`group rounded-[2rem] p-7 md:p-12 flex flex-col md:flex-row gap-10 md:gap-16 items-start border ${isDark ? 'border-gray-900' : 'border-gray-200'} ${soporte.bgColor} ${soporte.textColor || 'text-gray-950'} transition-all duration-300 hover:shadow-xl`}>
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${soporte.iconBg} ${soporte.iconColor} shadow-sm border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.16em] ${isDark ? 'text-gray-400 border-white/10' : 'text-gray-500 border-gray-200'} border rounded-full px-2.5 py-1`}>{soporte.eyebrow}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{soporte.name}</h2>
                  <p className={`text-base md:text-lg leading-relaxed max-w-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{soporte.description}</p>
                  <Link to={soporte.link} className={buttonStyles({ variant: isDark ? 'default' : 'outline', className: 'rounded-full' })}>
                    Ver inventario disponible <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className={`flex-1 w-full rounded-2xl p-7 md:p-8 ${isDark ? 'bg-white/[0.05] border-white/10' : 'bg-white border-gray-200'} border`}>
                  <h3 className={`font-bold mb-6 uppercase tracking-[0.14em] text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Características principales</h3>
                  <ul className="space-y-4">
                    {soporte.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0 bg-red-500" aria-hidden="true" />
                        <span className={`leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
