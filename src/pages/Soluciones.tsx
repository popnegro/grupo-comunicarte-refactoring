import { ArrowRight, Lightbulb, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';
import { InteriorHero } from '../components/layout/InteriorHero';

export default function Soluciones() {
  const soluciones = [
    { title: 'Campañas de Cobertura Masiva', description: 'Maximizamos el alcance de tu marca utilizando circuitos estratégicos de cartelería tradicional en los principales nudos viales y accesos.', icon: Zap, label: 'OOH' },
    { title: 'Activaciones Digitales DOOH', description: 'Formatos dinámicos en pantallas LED de alta resolución, con contenidos flexibles y actualización por franjas horarias.', icon: Lightbulb, label: 'DOOH' },
    { title: 'Circuitos Móviles', description: 'Llevamos tu mensaje directamente a zonas de alto tránsito peatonal y vehicular, ideal para lanzamientos, eventos y posicionamiento.', icon: TrendingUp, label: 'LED Móvil' }
  ];

  return (
    <div className="flex flex-col w-full bg-white">
      <InteriorHero
        eyebrow="Nuestros servicios"
        title="Soluciones para ganar presencia."
        description="Combinamos medios OOH, tecnología DOOH y circuitos móviles para conectar tu marca con la audiencia correcta."
        align="center"
      />

      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-12">
          <div>
            <p className="text-eyebrow mb-3">Elegí tu formato</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Una solución para cada objetivo</h2>
          </div>
          <p className="text-gray-500 max-w-md md:text-right leading-relaxed">Desde cobertura masiva hasta experiencias digitales y campañas en movimiento.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {soluciones.map((solucion, idx) => {
            const Icon = solucion.icon;
            return (
              <article key={idx} className="group flex flex-col bg-white p-8 md:p-9 rounded-3xl border border-gray-200 hover:border-gray-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-h-[360px]">
                <div className="flex items-start justify-between gap-4">
                  <div className="w-14 h-14 bg-gray-950 text-white rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-colors"><Icon className="w-6 h-6" /></div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 border border-gray-200 rounded-full px-2.5 py-1">{solucion.label}</span>
                </div>
                <div className="mt-auto pt-12">
                  <h3 className="text-xl font-bold text-gray-950 mb-3">{solucion.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{solucion.description}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-14 flex justify-center">
          <Link to="/inventario" className={buttonStyles({ size: 'lg', className: 'rounded-full px-7' })}>Explorar inventario <ArrowRight className="w-4 h-4 ml-2" /></Link>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8 rounded-3xl border border-gray-200 bg-[#F9F9F9] p-8 md:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600 mb-3">Planificá con contexto</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-950">Encontrá el soporte que mejor acompaña tu objetivo.</h2>
          </div>
          <Link to="/inventario" className={buttonStyles({ size: 'lg', className: 'rounded-full shrink-0' })}>Ver soportes <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>
    </div>
  );
}
