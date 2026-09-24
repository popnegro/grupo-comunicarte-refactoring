import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'warning';
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerLabel?: string;
  align?: 'left' | 'right';
  className?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  triggerLabel = 'Más opciones',
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 220);
    }
    setIsOpen((prev) => !prev);
  };

  const positionClasses = openUpwards
    ? align === 'right'
      ? 'bottom-full mb-1 right-0 origin-bottom-right'
      : 'bottom-full mb-1 left-0 origin-bottom-left'
    : align === 'right'
    ? 'top-full mt-1 right-0 origin-top-right'
    : 'top-full mt-1 left-0 origin-top-left';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={triggerLabel}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-transparent p-2 text-gray-500 transition-colors hover:border-gray-200 hover:bg-gray-50 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-300 sm:min-h-[34px] sm:min-w-[34px] sm:p-1.5"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute z-40 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg shadow-gray-950/5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 ${positionClasses}`}
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            const isDanger = item.variant === 'danger';
            const isWarning = item.variant === 'warning';

            let itemColorClasses = 'text-gray-700 hover:bg-gray-50 hover:text-gray-950';
            if (isDanger) {
              itemColorClasses = 'text-red-600 hover:bg-red-50 hover:text-red-700';
            } else if (isWarning) {
              itemColorClasses = 'text-amber-700 hover:bg-amber-50 hover:text-amber-800';
            }

            return (
              <button
                key={index}
                role="menuitem"
                type="button"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  item.onClick();
                }}
                className={`flex min-h-[44px] w-full items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-[36px] ${itemColorClasses}`}
              >
                {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
