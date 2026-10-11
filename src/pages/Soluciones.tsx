import { ArrowRight, Lightbulb, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';
import { InteriorHero } from '../components/layout/InteriorHero';

export default function Soluciones() {
  const soluciones = [
    {
      index: '01',
      title: 'Campañas de Cobertura Masiva',
      description: 'Maximizamos el alcance de tu marca utilizando circuitos estratégicos de cartelería tradicional en los principales nudos viales y accesos.',
      icon: Zap,
      label: 'Vía pública',
    },
    {
      index: '02',
      title: 'Activaciones Digitales DOOH',
      description: 'Formatos dinámicos en pantallas LED de alta resolución. Permiten actualizar creatividades en tiempo real y comunicar por franjas horarias.',
      icon: Lightbulb,
      label: 'Digital',
    },
    {
      index: '03',
      title: 'Circuitos Móviles',
      description: 'Llevamos tu mensaje directamente a zonas de alto tránsito peatonal y vehicular, ideal para lanzamientos, eventos y posicionamiento de marca en movimiento.',
      icon: TrendingUp,
      label: 'LED Móvil',
    },
  ];

  return (
    <div className="flex w-full flex-col bg-white">
      <InteriorHero
        eyebrow="Soluciones de comunicación exterior"
        title="Medios que conectan tu marca con la ciudad."
        description="Soluciones OOH y DOOH diseñadas para combinar alcance, ubicación y tecnología según el objetivo de cada campaña."
        align="left"
        actions={<Link to="/inventario" className={buttonStyles({ size: 'default' })}>Explorar inventario <ArrowRight className="h-4 w-4" /></Link>}
      />

      <section className="section-space bg-[#F9F9F9]">
        <div className="page-container">
          <div className="mb-10 max-w-2xl border-b border-gray-200 pb-6">
            <p className="text-eyebrow">Cómo podemos ayudarte</p>
            <h2 className="text-section-title mt-3">Elegí el formato según tu objetivo.</h2>
            <p className="text-body mt-3">Tres líneas de medios, una misma lógica: ubicación estratégica, claridad comercial y presencia medible.</p>
          </div>

          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {soluciones.map((solucion) => {
              const Icon = solucion.icon;
              return (
                <article key={solucion.index} className="grid gap-6 py-8 md:grid-cols-[72px_minmax(0,1fr)_minmax(260px,0.8fr)] md:items-start md:gap-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-950 text-white">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-eyebrow text-gray-400">{solucion.index}</span>
                      <span className="text-eyebrow">{solucion.label}</span>
                    </div>
                    <h3 className="text-card-title">{solucion.title}</h3>
                  </div>
                  <p className="text-body max-w-xl">{solucion.description}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link to="/inventario" className={buttonStyles({ size: 'default' })}>Explorar inventario <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/contacto" className={buttonStyles({ variant: 'outline', size: 'default' })}>Hablar con ventas</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
