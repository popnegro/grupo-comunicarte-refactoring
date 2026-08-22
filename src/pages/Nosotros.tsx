import { Target, TrendingUp, Users } from 'lucide-react';
import { buttonStyles } from '../components/ui/Button';

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
      description: 'Entendemos los objetivos de tu negocio. Brindamos asesoramiento personalizado para maximizar el ROI de tus campañas publicitarias.',
      icon: Users
    }
  ];

  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero */}
      <section 
        className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 w-full border-b border-gray-100"
        style={{
          backgroundImage: 'url(/brand/pattern-light.webp)',
          backgroundRepeat: 'repeat'
        }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]"></div>
        <div className="relative flex flex-col items-start max-w-7xl mx-auto z-10">
          <div className="max-w-3xl">
            <span className="text-red-600 font-bold tracking-wider uppercase text-sm mb-4">Acerca de nosotros</span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8">
              Conectamos marcas con audiencias en movimiento.
            </h1>
            <p className="text-xl text-gray-800 font-medium leading-relaxed">
              Grupo Comunicarte es la empresa líder en soluciones de publicidad Exterior (OOH) y Digital (DOOH) con presencia dominante en las plazas más competitivas de Mendoza y Buenos Aires. 
            </p>
          </div>
        </div>
      </section>

      {/* Stats / Presence */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="flex flex-col items-center text-center pt-8 md:pt-0">
              <span className="text-5xl font-black text-gray-900 mb-2">2+</span>
              <span className="text-gray-500 font-medium uppercase tracking-wider text-sm">Plazas Estratégicas</span>
            </div>
            <div className="flex flex-col items-center text-center pt-8 md:pt-0">
              <span className="text-5xl font-black text-gray-900 mb-2">100%</span>
              <span className="text-gray-500 font-medium uppercase tracking-wider text-sm">Visibilidad Garantizada</span>
            </div>
            <div className="flex flex-col items-center text-center pt-8 md:pt-0">
              <span className="text-5xl font-black text-red-600 mb-2">Premium</span>
              <span className="text-gray-500 font-medium uppercase tracking-wider text-sm">Calidad de Soportes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Nuestros Pilares</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="flex flex-col items-start">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{pillar.title}</h3>
                <p className="text-gray-500 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 py-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Llevá tu marca al siguiente nivel
          </h2>
          <p className="text-lg text-gray-400 mb-10">
            Nuestro equipo comercial está listo para asesorarte y diseñar la cobertura ideal para tu próxima campaña.
          </p>
          <a href="mailto:ventas@grupocomunicarte.com" className={buttonStyles({ variant: "outline", size: "lg", className: "rounded-full" })}>
            Contactar Ventas
          </a>
        </div>
      </section>
    </div>
  );
}
