import type { ReactNode } from 'react';

/** Shared visual tokens for the support product editor. */
export const inputClass =
  'mt-1 h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10';
export const textareaClass =
  'mt-1 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10';
export const labelClass = 'text-xs font-bold uppercase tracking-wider text-gray-500';
export const sectionClass = 'rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs';

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
};

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  readOnly = false,
}: FieldProps) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        readOnly={readOnly}
        min={type === 'number' ? '0' : undefined}
        inputMode={type === 'number' ? 'decimal' : undefined}
        className={`${inputClass}${readOnly ? ' bg-gray-50 text-gray-500' : ''}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function BadgeField({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-800">
      <span className="mr-1.5 text-gray-500">{label}</span>
      {value}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-eyebrow text-gray-500">{eyebrow}</div>
        <h2 className="mt-1 text-lg font-bold text-gray-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}
