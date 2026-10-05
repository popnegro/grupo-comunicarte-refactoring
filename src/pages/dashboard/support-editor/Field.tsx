import type { ReactNode } from 'react';

/** Shared visual tokens for the support product editor (dense, sober). */
export const inputClass =
  'mt-0.5 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10';
export const textareaClass =
  'mt-0.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10';
export const labelClass = 'text-[11px] font-bold uppercase tracking-wider text-gray-500';
export const sectionClass = 'rounded-xl border border-gray-200 bg-white p-4';

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
    <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-800">
      <span className="mr-1 text-gray-500">{label}</span>
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
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">{eyebrow}</div>
        <h2 className="mt-0.5 text-base font-bold text-gray-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}
