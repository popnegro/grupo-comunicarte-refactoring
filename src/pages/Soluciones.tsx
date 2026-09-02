import { ArrowRight, Lightbulb, TrendingUp, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';
import { InteriorHero } from '../components/layout/InteriorHero';

export default function Soluciones() {
  const soluciones = [
    { title: 'Campañas de Cobertura Masiva', description: 'Maximizamos el alcance de tu marca utilizando circuitos estratégicos de cartelería tradicional en los principales nudos viales y accesos.', icon: Zap, label: 'OOH' },
    { title: 'Activaciones Digitales DOOH y Tradicionales OOH', description: 'Formatos dinámicos en pantallas LED de alta resolución, con contenidos flexibles y actualización por franjas horarias.', icon: Lightbulb, label: 'DOOH' },
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

      <section className="px-4 py-24 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full md:py-32">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-12">
          <div>
            <p className="text-eyebrow mb-3">Elegí tu formato</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Una solución para cada objetivo</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {soluciones.map((solucion, idx) => {
            const Icon = solucion.icon;
            return (
              <article key={idx} className="group flex flex-col bg-[#F9F9F9] p-8 md:p-9 rounded-3xl border border-gray-200 hover:border-gray-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-h-[360px]">
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
      </section>

      <section className="border-t border-gray-200 bg-white px-4 py-24 sm:py-28 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full bg-gray-100 border border-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-red-600" /> Planificá tu pauta hoy
          </div>
          <h2 className="mb-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-950">
            Encontrá el soporte adecuado para tu marca
          </h2>
          <p className="mx-auto mb-10 max-w-2xl leading-relaxed text-gray-600 text-base sm:text-lg">
            Explorá nuestra cobertura interactiva, seleccioná los espacios que te interesan y solicitá tu propuesta comercial en minutos.
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
