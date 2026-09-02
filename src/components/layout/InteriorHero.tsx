import { ReactNode } from 'react';

interface InteriorHeroProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
}

export function InteriorHero({ eyebrow, title, description, align = 'left' }: InteriorHeroProps) {
  return (
    <section className="relative overflow-hidden text-white px-4 py-24 sm:px-6 lg:px-8 md:py-32">
      {/* Fondo con degradado personalizado */}
      <div className="absolute inset-0 bg-[linear-gradient(124deg,rgba(0,0,0,1)_0%,_rgba(0,0,0,1)_100%,_rgba(0,122,85,1)_100%)]" aria-hidden="true" />

      {/* Resplandores de Esquinas con Blur */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-red-600/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" aria-hidden="true" />

      {/* Contenido Principal */}
      <div className={`relative z-10 max-w-7xl mx-auto ${align === 'center' ? 'text-center' : ''}`}>
        <div className={align === 'center' ? 'max-w-4xl mx-auto' : 'max-w-4xl'}>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-7 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase">{eyebrow}</span>
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.045em] leading-[0.98] mb-7">{title}</h1>
          {description && <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-3xl mx-auto text-center">{description}</p>}
        </div>
      </div>
    </section>

  );
}