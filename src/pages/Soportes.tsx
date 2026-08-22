import { ArrowRight, MapPin, MonitorPlay, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';

export default function Soportes() {
  const soportes = [
    {
      id: 'tradicional',
      name: 'Vía Pública Tradicional',
      icon: MapPin,
      description: 'Cobertura masiva con ubicaciones estratégicas de alto tránsito en Mendoza y Buenos Aires.',
      features: [
        'Cartelería espectacular y gigantografías',
        'Sextuples y mobiliario urbano',
        'Puntos de ingreso a la ciudad y rutas principales',
        'Iluminación Frontlight para impacto nocturno'
      ],
      link: '/inventario?tipo=tradicional',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-900',
      iconBg: 'bg-white'
    },
    {
      id: 'led',
      name: 'Pantallas LED (DOOH)',
      icon: MonitorPlay,
      description: 'Soportes digitales de alta resolución en los puntos neurálgicos de mayor concentración comercial.',
      features: [
        'Tecnología LED P4 y P6 de alta definición',
        'Formatos dinámicos y rotativos',
        'Contenidos flexibles y actualización en tiempo real',
        'Ubicaciones premium en nudos viales y centros comerciales'
      ],
      link: '/inventario?tipo=led',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      iconBg: 'bg-white'
    },
    {
      id: 'led_movil',
      name: 'Camión LED Móvil',
      icon: Truck,
      description: 'Impacto en movimiento. Llevamos tu mensaje directamente a donde está tu audiencia.',
      features: [
        'Pantallas LED laterales de 4x2m',
        'Rutas estratégicas programables',
        'Activaciones de marca y eventos',
        'Alta visibilidad a nivel peatonal y vehicular'
      ],
      link: '/inventario?tipo=led_movil',
      bgColor: 'bg-gray-900',
      textColor: 'text-white',
      iconColor: 'text-white',
      iconBg: 'bg-white/10'
    }
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section 
        className="relative bg-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 border-b border-gray-100"
        style={{
          backgroundImage: 'url(/brand/pattern-light.webp)',
          backgroundRepeat: 'repeat'
        }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]"></div>
        <div className="relative max-w-7xl mx-auto z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Nuestros Soportes
          </h1>
          <p className="text-xl text-gray-800 font-medium max-w-3xl leading-relaxed">
            Ofrecemos un ecosistema de medios publicitarios Out-Of-Home diseñado para maximizar el alcance de tu marca, combinando la presencia ineludible del formato tradicional con la versatilidad de la era digital.
          </p>
        </div>
      </section>

      {/* Soportes List */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          {soportes.map((soporte) => {
            const Icon = soporte.icon;
            const isDark = soporte.id === 'led_movil';
            return (
              <div 
                key={soporte.id} 
                className={`rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 md:gap-16 items-start ${soporte.bgColor} ${soporte.textColor || 'text-gray-900'}`}
              >
                <div className="flex-1 space-y-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${soporte.iconBg} ${soporte.iconColor} shadow-sm border ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">{soporte.name}</h2>
                  <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {soporte.description}
                  </p>
                  
                  <Link 
  to={soporte.link}
  className={buttonStyles({ variant: isDark ? 'default' : 'outline' })}
>
                    Ver inventario disponible
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <div className="flex-1 w-full bg-black/5 rounded-2xl p-8 backdrop-blur-sm border border-black/5">
                  <h3 className={`text-lg font-bold mb-6 uppercase tracking-wider text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Características Principales
                  </h3>
                  <ul className="space-y-4">
                    {soporte.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${isDark ? 'bg-red-500' : 'bg-red-500'}`} />
                        <span className={`leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
