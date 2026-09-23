import { ReactNode } from 'react';

interface InteriorHeroProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  actions?: ReactNode;
}

export function InteriorHero({ eyebrow, title, description, align = 'left', actions }: InteriorHeroProps) {
  const centered = align === 'center';

  return (
    <header className="relative overflow-hidden border-b border-gray-200 bg-white">
      <div className={`page-container flex flex-col gap-6 py-16 md:py-20 lg:flex-row lg:items-end lg:justify-between ${centered ? 'lg:items-center' : ''}`}>
        <div className={centered ? 'max-w-3xl text-center lg:mx-auto' : 'max-w-3xl'}>
          <div className="mb-1 flex items-center gap-3"><span className="h-px w-8 bg-gray-900" /><p className="text-eyebrow">{eyebrow}</p></div>
          <h1 className="text-page-title mt-3">{title}</h1>
          {description && (
            <p className={`text-body mt-5 max-w-2xl ${centered ? 'mx-auto' : ''}`}>{description}</p>
          )}
        </div>
        {actions && (
          <div className={`flex shrink-0 flex-col gap-2 sm:flex-row ${centered ? 'lg:justify-center' : ''}`}>
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
