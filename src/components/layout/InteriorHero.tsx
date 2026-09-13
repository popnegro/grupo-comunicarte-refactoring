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
    <header className="border-b border-gray-200 bg-white">
      <div className={`page-container flex flex-col gap-6 py-14 md:py-16 lg:flex-row lg:items-end lg:justify-between ${centered ? 'lg:items-center' : ''}`}>
        <div className={centered ? 'max-w-3xl text-center lg:mx-auto' : 'max-w-3xl'}>
          <p className="text-eyebrow">{eyebrow}</p>
          <h1 className="text-page-title mt-3">{title}</h1>
          {description && (
            <p className={`text-body mt-4 max-w-2xl ${centered ? 'mx-auto' : ''}`}>{description}</p>
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
