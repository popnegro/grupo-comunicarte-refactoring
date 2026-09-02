import { ArrowRight, Target, TrendingUp, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';
import { InteriorHero } from '../components/layout/InteriorHero';
import { useEffect, useState } from 'react';

interface CounterProps {
  end: number;
  duration?: number;
  prefix?: string;  // Texto/Símbolo que va antes
  suffix?: string;  // Texto/Símbolo que va después
  className?: string;
}

export function AnimatedCounter({
  end,
  duration = 1500,
  prefix = '',
  suffix = '',
  className = ''
}: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressPercentage = Math.min(progress / duration, 1);
      const easeOutQuad = progressPercentage * (2 - progressPercentage);

      setCount(Math.floor(easeOutQuad * end));

      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  // Renderiza el prefijo, el número animado y el sufijo en orden
  return (
    <span className={className}>
      {prefix}{count}{suffix}
    </span>
  );
}


export default function Nosotros() {
  const pillars = [
    {
      title: 'Ubicaciones Estratégicas',
      description: 'Cada espacio es seleccionado rigurosamente por su volumen de tránsito vehicular y peatonal, garantizando una alta tasa de contacto visual con tu audiencia.',
      icon: Target
    },
    {
      title: 'Digitalización DOOH',
      description: 'Modernizamos la vía pública con pantallas dinámicas de alta definición para ofrecer contenidos dinámicos, adaptables y con óptimo contraste diurno y nocturno.',
      icon: TrendingUp
    },
    {
      title: 'Asesoramiento Profesional',
      description: 'Acompañamos a marcas, agencias y pymes en el diseño de su mix de medios, optimizando la distribución de la pauta para maximizar el retorno de inversión.',
      icon: Users
    }
  ];

  return (
    <div className="flex flex-col w-full bg-white">
      <InteriorHero
        eyebrow="Acerca de nosotros"
        title="Conectamos marcas con audiencias en movimiento."
        description="Especialistas en comunicación exterior y pantallas digitales. Conectamos anunciantes con las ubicaciones más transitadas de Mendoza y Buenos Aires mediante una gestión ágil y transparente."
        align="center"
      />

      <section className="py-16 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-200 rounded-3xl overflow-hidden bg-white">

            {/* Primer Contador: Anima hasta 30 con prefijo "+" */}
            <div className="p-8 md:p-10 text-center md:text-left border-b md:border-b-0 md:border-r border-gray-200">
              <AnimatedCounter
                prefix="+"
                end={30}
                className="text-5xl font-black tracking-tight text-red-600"
              />
              <span className="block mt-2 text-gray-500 font-bold uppercase tracking-[0.14em] text-xs">
                Soportes activos en Mendoza y Buenos Aires
              </span>
            </div>

            {/* Segundo Contador: Cobertura en puntos de alto flujo */}
            <div className="p-8 md:p-10 text-center md:text-left border-b md:border-b-0 md:border-r border-gray-200">
              <span className="text-5xl font-black tracking-tight text-red-600">Puntos Clave</span>
              <span className="block mt-2 text-gray-500 font-bold uppercase tracking-[0.14em] text-xs">
                Ubicaciones de máxima visibilidad urbana
              </span>
            </div>

            {/* Tercer Bloque: Presencia en Mendoza y Buenos Aires */}
            <div className="p-8 md:p-10 text-center md:text-left">
              <span className="text-5xl font-black tracking-tight text-red-600">2</span>
              <span className="block mt-2 text-gray-500 font-bold uppercase tracking-[0.14em] text-xs">
                Plazas estratégicas nacionales
              </span>
            </div>

          </div>
        </div>
      </section>


      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full md:py-32">
        <div className="max-w-2xl mb-14">
          <p className="text-eyebrow mb-3">Cómo trabajamos</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-950 tracking-tight mb-4">Nuestros pilares</h2>
          <p className="text-gray-500 leading-relaxed">Una mirada estratégica sobre ubicación, tecnología y resultados para construir campañas que se hagan notar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <article key={idx} className="group flex flex-col bg-white border border-gray-200 rounded-3xl p-8 md:p-9 hover:border-gray-400 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gray-950 text-white rounded-2xl flex items-center justify-center mb-8 group-hover:bg-red-600 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-950 mb-3">{pillar.title}</h3>
                <p className="text-gray-500 leading-relaxed">{pillar.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white px-4 py-24 sm:py-28 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full bg-gray-100 border border-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-red-600" /> Planificá tu pauta hoy
          </div>
          <h2 className="mb-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-950">
            Trabajemos juntos en tu próximo impacto
          </h2>
          <p className="mx-auto mb-10 max-w-2xl leading-relaxed text-gray-600 text-base sm:text-lg">
            Descubrí la cobertura publicitaria que mejor se adapta a la zona de influencia de tu negocio y solicitá un presupuesto a medida.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/inventario"
              className={buttonStyles({
                size: 'lg',
                className: 'inline-flex rounded-full px-8 font-semibold shadow-md'
              })}
            >
              Explorar inventario <ArrowRight className="h-5 w-5 ml-1" />
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
