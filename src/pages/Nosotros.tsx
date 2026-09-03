import { ArrowRight, Target, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';
import { InteriorHero } from '../components/layout/InteriorHero';
import { useEffect, useState } from 'react';

interface CounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({ end, duration = 1500, prefix = '', suffix = '', className = '' }: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressPercentage = Math.min(progress / duration, 1);
      setCount(Math.floor(progressPercentage * (2 - progressPercentage) * end));
      if (progress < duration) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span className={className}>{prefix}{count}{suffix}</span>;
}

export default function Nosotros() {
  const pillars = [
    {
      title: 'Ubicaciones Estratégicas',
      description: 'Cada espacio es seleccionado rigurosamente por su volumen de tránsito vehicular y peatonal, garantizando una alta tasa de contacto visual con tu audiencia.',
      icon: Target,
    },
    {
      title: 'Digitalización DOOH',
      description: 'Modernizamos la vía pública con pantallas dinámicas de alta definición para ofrecer contenidos adaptables y con óptimo contraste diurno y nocturno.',
      icon: TrendingUp,
    },
    {
      title: 'Asesoramiento Profesional',
      description: 'Acompañamos a marcas, agencias y pymes en el diseño de su mix de medios, optimizando la distribución de la pauta para maximizar el retorno de inversión.',
      icon: Users,
    },
  ];

  return (
    <div className="flex flex-col w-full bg-white">
      <InteriorHero
        eyebrow="Acerca de nosotros"
        title="Conectamos marcas con audiencias en movimiento."
        description="Especialistas en comunicación exterior y pantallas digitales. Conectamos anunciantes con las ubicaciones más transitadas de Mendoza y Buenos Aires mediante una gestión ágil y transparente."
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

      <section className="border-b border-gray-200 bg-[#F9F9F9] px-4 py-8 sm:px-6 lg:px-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 bg-white md:grid-cols-3">
            <div className="border-b border-gray-200 p-6 md:border-b-0 md:border-r md:p-7">
              <AnimatedCounter prefix="+" end={30} className="text-4xl font-black tracking-tight text-gray-950" />
              <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Soportes activos en Mendoza y Buenos Aires</span>
            </div>
            <div className="border-b border-gray-200 p-6 md:border-b-0 md:border-r md:p-7">
              <span className="text-4xl font-black tracking-tight text-gray-950">Puntos clave</span>
              <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Ubicaciones de máxima visibilidad urbana</span>
            </div>
            <div className="p-6 md:p-7">
              <span className="text-4xl font-black tracking-tight text-gray-950">2</span>
              <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Plazas estratégicas nacionales</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 border-b border-gray-200 pb-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Cómo trabajamos</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 md:text-3xl">Nuestros pilares</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">Una mirada estratégica sobre ubicación, tecnología y resultados para construir campañas que se hagan notar.</p>
          </div>

          <div className="grid grid-cols-1 divide-y divide-gray-200 border-y border-gray-200 md:grid-cols-3 md:divide-x md:divide-y-0">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article key={pillar.title} className="group p-6 md:p-7 md:first:pl-0 md:last:pr-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-950 text-white transition-colors group-hover:bg-brand-emerald">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-gray-950">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{pillar.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
