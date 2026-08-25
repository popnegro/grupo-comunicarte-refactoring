import { ReactNode } from 'react';

interface InteriorHeroProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
}

export function InteriorHero({ eyebrow, title, description, align = 'left' }: InteriorHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#111111] text-white px-4 py-24 sm:px-6 lg:px-8 md:py-32">
      <div className="absolute inset-0 bg-[url('/brand/pattern-light.webp')] bg-repeat opacity-[0.06]" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#111111] to-[#252525]" aria-hidden="true" />
      <div className={`relative z-10 max-w-7xl mx-auto ${align === 'center' ? 'text-center' : ''}`}>
        <div className={align === 'center' ? 'max-w-4xl mx-auto' : 'max-w-4xl'}>
          <span className="inline-flex items-center gap-2 text-red-400 font-bold tracking-[0.18em] uppercase text-[11px] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />
            {eyebrow}
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.045em] leading-[0.98] mb-7">{title}</h1>
          {description && <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-3xl">{description}</p>}
        </div>
      </div>
    </section>
  );
}
