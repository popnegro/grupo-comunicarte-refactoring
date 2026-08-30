import { Target, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';
import { InteriorHero } from '../components/layout/InteriorHero';

export default function Nosotros() {
  const pillars = [
    {
      title: 'Alcance Estratégico',
      description: 'Seleccionamos cada locación mediante análisis de tráfico y visibilidad, garantizando que tu mensaje impacte a la audiencia correcta en el momento justo.',
      icon: Target
    },
    {
      title: 'Innovación DOOH',
      description: 'Lideramos la transición hacia soportes digitales en la vía pública, ofreciendo flexibilidad de contenidos y calidad visual inigualable.',
      icon: TrendingUp
    },
    {
      title: 'Compromiso B2B',
      description: 'Entendemos los objetivos de tu negocio y brindamos asesoramiento personalizado para maximizar el rendimiento de tus campañas.',
      icon: Users
    }
  ];

  return (
    <div className="flex flex-col w-full bg-white">
      <InteriorHero
        eyebrow="Acerca de nosotros"
        title="Conectamos marcas con audiencias en movimiento."
        description="Grupo Comunicarte desarrolla soluciones de publicidad exterior OOH y digital DOOH en las plazas más competitivas de Mendoza y Buenos Aires."
      />

      <section className="py-16 bg-[#F9F9F9] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-200 rounded-3xl overflow-hidden bg-white">
            <div className="p-8 md:p-10 text-center md:text-left border-b md:border-b-0 md:border-r border-gray-200">
              <span className="text-5xl font-black tracking-tight text-gray-950">2+</span>
              <span className="block mt-2 text-gray-500 font-bold uppercase tracking-[0.14em] text-xs">Plazas estratégicas</span>
            </div>
            <div className="p-8 md:p-10 text-center md:text-left border-b md:border-b-0 md:border-r border-gray-200">
              <span className="text-5xl font-black tracking-tight text-gray-950">100%</span>
              <span className="block mt-2 text-gray-500 font-bold uppercase tracking-[0.14em] text-xs">Visibilidad garantizada</span>
            </div>
            <div className="p-8 md:p-10 text-center md:text-left">
              <span className="text-5xl font-black tracking-tight text-red-600">Premium</span>
              <span className="block mt-2 text-gray-500 font-bold uppercase tracking-[0.14em] text-xs">Calidad de soportes</span>
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

      <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-200 text-center md:py-32">
        <div className="max-w-3xl mx-auto">
          <p className="text-eyebrow mb-4">El próximo paso</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Hablemos de tu próxima campaña</h2>
          <p className="text-gray-500 text-lg mb-10 leading-relaxed">Nuestro equipo comercial está listo para asesorarte y diseñar la cobertura ideal para tus objetivos.</p>
          <Link to="/contacto" className={buttonStyles({ size: 'lg', className: 'rounded-full px-7' })}>Contactar Ventas</Link>
        </div>
      </section>
    </div>
  );
}
