import type { ReactNode } from 'react';
import { Input } from './Input';

export const labelClass = 'text-[11px] font-bold uppercase tracking-wider text-gray-500';
export const sectionClass = 'rounded-xl border border-gray-200 bg-white p-4';
export const inputClass = 'h-10 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-gray-950 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500';
export const textareaClass = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10';

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  id?: string;
};

const fieldId = (label: string) =>
  `field-${label.toLowerCase().replace(/[^a-z0-9áéíóúüñ]+/gi, '-').replace(/^-|-$/g, '')}`;

export function Field({ label, value, onChange, type = 'text', placeholder, readOnly = false, id }: FieldProps) {
  const inputId = id || fieldId(label);
  return (
    <div>
      <label htmlFor={inputId} className={labelClass}>{label}</label>
      <Input
        id={inputId}
        readOnly={readOnly}
        min={type === 'number' ? '0' : undefined}
        inputMode={type === 'number' ? 'decimal' : undefined}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={readOnly ? 'bg-gray-50 text-gray-500' : undefined}
      />
    </div>
  );
}

export function Textarea({ label, value, onChange, placeholder, maxLength, className, id }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number; className?: string; id?: string;
}) {
  const textareaId = id || fieldId(label);
  return (
    <div>
      <label htmlFor={textareaId} className={labelClass}>{label}</label>
      <textarea id={textareaId} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength}
        className={`mt-0.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 ${className || ''}`} />
    </div>
  );
}

export function BadgeField({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-800">
      <span className="mr-1 text-gray-500">{label}</span>{value}
    </span>
  );
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div><div className={labelClass}>{eyebrow}</div><h2 className="mt-0.5 text-base font-bold text-gray-900">{title}</h2></div>
      {action}
    </div>
  );
}
