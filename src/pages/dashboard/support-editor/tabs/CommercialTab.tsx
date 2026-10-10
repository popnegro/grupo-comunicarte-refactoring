import type { FormState } from '../types';
import { Field, labelClass, sectionClass } from '../../../../components/dashboard/ui/Field';
import { formatSupportCurrency } from '../../../../lib/supportPricing';

type Props = {
  form: FormState;
  set: (patch: Partial<FormState>) => void;
  setNested: (key: 'traditional' | 'led' | 'mobile' | 'pricing', patch: any) => void;
  pricingTotal: number;
};

export function CommercialTab({ form, set, setNested, pricingTotal }: Props) {
  return (
    <div
      id="editor-panel-commercial"
      role="tabpanel"
      aria-labelledby="editor-tab-commercial"
      className="block"
    >
      <section className={sectionClass}>
        <div>
          <div className="text-eyebrow text-gray-500">COMERCIAL Y FECHAS</div>
          <h2 className="mt-1 text-base font-bold text-gray-900">Configuración comercial</h2>
        </div>
        <div className="mt-3 space-y-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className={labelClass}>Disponibilidad</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => set({ disponibilidad: 'disponible', reservedFrom: '', reservedUntil: '' })}
                className={`min-h-[40px] rounded-lg px-3 py-2 text-xs font-bold sm:min-h-0 ${
                  form.disponibilidad === 'disponible'
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-500'
                }`}
              >
                Disponible
              </button>
              <button
                type="button"
                onClick={() => set({ disponibilidad: 'reservado' })}
                className={`min-h-[40px] rounded-lg px-3 py-2 text-xs font-bold sm:min-h-0 ${
                  form.disponibilidad === 'reservado'
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-500'
                }`}
              >
                Reservado
              </button>
            </div>
            {form.disponibilidad === 'reservado' && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Desde" type="date" value={form.reservedFrom} onChange={(v) => set({ reservedFrom: v })} />
                <Field label="Hasta" type="date" value={form.reservedUntil} onChange={(v) => set({ reservedUntil: v })} />
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className={labelClass}>Estado de publicación</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => set({ active: true })}
                className={`min-h-[40px] rounded-lg px-3 py-2 text-xs font-bold sm:min-h-0 ${
                  form.active ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500'
                }`}
              >
                Publicado
              </button>
              <button
                type="button"
                onClick={() => set({ active: false })}
                className={`min-h-[40px] rounded-lg px-3 py-2 text-xs font-bold sm:min-h-0 ${
                  !form.active ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500'
                }`}
              >
                Archivado
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">PRICING INTERNO</div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Field label="Exhibición" value={form.pricing.exhibition} onChange={(v) => setNested('pricing', { exhibition: v })} />
              <Field label="Instalación" value={form.pricing.installation} onChange={(v) => setNested('pricing', { installation: v })} />
              {form.tipo_soporte === 'tradicional' && (
                <Field label="Impresión" value={form.pricing.printing} onChange={(v) => setNested('pricing', { printing: v })} />
              )}
              <Field label="Mensual" value={form.pricing.monthly} onChange={(v) => setNested('pricing', { monthly: v })} />
              {form.tipo_soporte !== 'tradicional' && (
                <Field label="Exclusivo" value={form.pricing.exclusive} onChange={(v) => setNested('pricing', { exclusive: v })} />
              )}
              <Field label="Moneda" value={form.pricing.currency} onChange={(v) => setNested('pricing', { currency: v })} />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2.5">
              <div>
                <div className={labelClass}>TOTAL SOPORTE</div>
                <div className="mt-0.5 text-[11px] text-gray-500">Exhibición + Instalación + Impresión</div>
              </div>
              <div className="text-lg font-extrabold text-emerald-900">
                {formatSupportCurrency(pricingTotal, form.pricing.currency || 'ARS')}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
