import React from 'react';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onActionClick,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      {actionLabel && (
        <div>
          <button
            type="button"
            onClick={onActionClick}
            className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};
