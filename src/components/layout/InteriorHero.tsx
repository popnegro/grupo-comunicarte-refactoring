import { ReactNode } from 'react';

interface InteriorHeroProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  actions?: ReactNode;
}

export function InteriorHero({
  eyebrow,
  title,
  description,
  align = 'left',
  actions,
}: InteriorHeroProps) {
  const centered = align === 'center';

  return (
    <section className="border-b border-gray-200 bg-white px-4 py-10 sm:px-6 md:py-12 lg:px-8">
      <div className={`mx-auto flex max-w-7xl flex-col gap-7 lg:flex-row lg:items-end lg:justify-between ${centered ? 'lg:items-center' : ''}`}>
        <div className={`${centered ? 'max-w-3xl text-center lg:mx-auto' : 'max-w-4xl'}`}>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">{eyebrow}</p>
          <h1 className="text-3xl font-bold tracking-[-0.035em] leading-tight text-gray-950 sm:text-4xl md:text-5xl">{title}</h1>
          {description && (
            <p className={`mt-4 max-w-3xl text-base leading-relaxed text-gray-600 md:text-lg ${centered ? 'mx-auto' : ''}`}>
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className={`flex shrink-0 flex-col gap-2 sm:flex-row ${centered ? 'lg:justify-center' : ''}`}>
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
