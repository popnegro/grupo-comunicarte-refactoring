import React from 'react';
import { Presentation, Truck, Tv, HelpCircle } from 'lucide-react';
import { SupportType } from '../../types/inventory';

interface TypeIconProps {
  type: SupportType | string;
  className?: string;
  showLabel?: boolean;
}

export const TypeIcon: React.FC<TypeIconProps> = ({ type, className = '', showLabel = true }) => {
  let icon = <Presentation className="w-4 h-4 text-blue-600 shrink-0" />;
  let labelText = type;
  let textClass = 'text-slate-700';

  switch (type) {
    case 'Tradicional':
      icon = <Presentation className="w-4 h-4 text-indigo-600 shrink-0" />;
      break;
    case 'LED móvil':
      icon = <Truck className="w-4 h-4 text-amber-600 shrink-0" />;
      break;
    case 'Pantallas LED':
      icon = <Tv className="w-4 h-4 text-blue-600 shrink-0" />;
      break;
    case 'Pendiente de mapeo':
      icon = <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />;
      textClass = 'text-slate-500 italic';
      break;
    default:
      icon = <Presentation className="w-4 h-4 text-slate-400 shrink-0" />;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${textClass} ${className}`}>
      {icon}
      {showLabel && <span className="font-medium text-xs sm:text-sm">{labelText}</span>}
    </span>
  );
};
