import { ArrowRight, Lightbulb, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';
import { InteriorHero } from '../components/layout/InteriorHero';

export default function Soluciones() {
  const soluciones = [
    { title: 'Campañas de Posicionamiento', description: 'Lográ máxima recordación de marca mediante circuitos de gran formato en los ingresos viales más transitados.', icon: Zap, label: 'OOH' },
    { title: 'Activaciones Comerciales', description: 'Impulsá tus ventas y promociones semanales utilizando la versatilidad de pantallas digitales con pauta horaria inteligente.', icon: Lightbulb, label: 'DOOH' },
    { title: 'Campañas de Proximidad', description: 'Conectá con tu audiencia en puntos de venta o eventos masivos a través de unidades móviles con pantallas LED gigantes.', icon: TrendingUp, label: 'LED Móvil' },
  ];

  return (
    <div className="flex flex-col w-full bg-white">
      <InteriorHero
        eyebrow="Objetivos de campaña"
        title="Soluciones diseñadas para tus objetivos comerciales"
        description="Adaptamos nuestros soportes publicitarios para acompañar el embudo de ventas y visibilidad de tu marca en cada etapa del negocio."
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

      <section className="px-4 py-12 sm:px-6 lg:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-2 border-b border-gray-200 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Elegí tu objetivo</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 md:text-3xl">Una solución para cada necesidad</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-gray-500">Seleccioná el enfoque de campaña y llevá la conversación al inventario disponible.</p>
          </div>

          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {soluciones.map((solucion) => {
              const Icon = solucion.icon;
              return (
                <article key={solucion.title} className="group grid gap-5 py-6 md:grid-cols-[auto_140px_1fr] md:items-start md:gap-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-950 text-white transition-colors group-hover:bg-brand-emerald">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">{solucion.label}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-950 md:text-xl">{solucion.title}</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600 md:text-base">{solucion.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
