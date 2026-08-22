import { ArrowRight, Lightbulb, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';

export default function Soluciones() {
  const soluciones = [
    {
      title: 'Campañas de Cobertura Masiva',
      description: 'Maximizamos el alcance de tu marca utilizando circuitos estratégicos de cartelería tradicional en los principales nudos viales y accesos.',
      icon: Zap
    },
    {
      title: 'Activaciones Digitales DOOH',
      description: 'Formatos dinámicos en pantallas LED de alta resolución. Permiten actualización de creatividades en tiempo real y comunicación por franjas horarias.',
      icon: Lightbulb
    },
    {
      title: 'Circuitos Móviles (Camiones LED)',
      description: 'Llevamos tu mensaje directamente a zonas de alto tránsito peatonal y vehicular, ideal para lanzamientos, eventos y posicionamiento de marca en movimiento.',
      icon: TrendingUp
    }
  ];

  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero Section */}
      <section 
        className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 border-b border-gray-100 bg-gray-50"
        style={{
          backgroundImage: 'url(/brand/pattern-light.webp)',
          backgroundRepeat: 'repeat'
        }}
      >
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"></div>
        <div className="relative max-w-7xl mx-auto z-10 text-center">
          <span className="text-red-600 font-bold tracking-wider uppercase text-sm mb-4 block">Nuestros Servicios</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Soluciones
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Grupo Comunicarte ofrece soluciones de comunicación y publicidad exterior (OOH) y digital (DOOH), diseñadas para conectar tu marca con la audiencia correcta.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {soluciones.map((solucion, idx) => {
            const Icon = solucion.icon;
            return (
              <div key={idx} className="flex flex-col items-start bg-gray-50 p-8 rounded-3xl border border-gray-100">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{solucion.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-6 flex-grow">
                  {solucion.description}
                </p>
              </div>
            );
          })}
        </div>
        
        <div className="mt-16 text-center">
            <Link to="/inventario" className={buttonStyles({ size: "lg", className: "rounded-full" })}>
                Explorar Inventario
                <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
        </div>
      </section>
    </div>
  );
}
