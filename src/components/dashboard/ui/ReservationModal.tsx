import React, { useEffect, useState, useRef } from 'react';
import { CalendarDays, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../lib/api';
import { Button } from '../../ui/Button';

export interface ReservationModalSupport {
  canonical_id: string;
  name: string;
  disponibilidad?: string;
  availableFrom?: string | null;
}

interface ReservationModalProps {
  isOpen: boolean;
  support: ReservationModalSupport | null;
  onClose: () => void;
  onSuccess: (updatedSupportId: string, disponibilidad: string) => void;
}

type ReservationForm = {
  disponibilidad: 'disponible' | 'reservado';
  from: string;
  until: string;
};

function parseLegacyPeriod(value: unknown): { from: string; until: string } {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return { from: '', until: '' };
  const [from, until] = raw.split('|');
  if (until) return { from: from || '', until: until || '' };
  return { from: '', until: '' };
}

function displayDate(value: string) {
  if (!value) return '';
  const parts = value.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  return value;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  support,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [form, setForm] = useState<ReservationForm>({
    disponibilidad: 'disponible',
    from: '',
    until: '',
  });
  const [supportName, setSupportName] = useState('');
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !support) return;

    setError('');
    setSupportName(support.name || 'Soporte');
    
    // Parse current initial period if available
    const initialPeriod = parseLegacyPeriod(support.availableFrom);
    setForm({
      disponibilidad: support.disponibilidad === 'reservado' ? 'reservado' : 'disponible',
      from: initialPeriod.from,
      until: initialPeriod.until,
    });

    // Fetch full fresh detail from API to ensure accurate state
    let isCancelled = false;
    const loadFresh = async () => {
      setLoadingDetail(true);
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          navigate('/login');
          return;
        }
        const res = await apiFetch(`/api/admin/supports/${encodeURIComponent(support.canonical_id)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          navigate('/login');
          return;
        }
        const json = await res.json();
        if (!isCancelled && res.ok && json.status === 'success' && json.data) {
          const data = json.data;
          const period = parseLegacyPeriod(data.availableFrom);
          if (data.name) setSupportName(String(data.name));
          setForm({
            disponibilidad: data.disponibilidad === 'reservado' ? 'reservado' : 'disponible',
            from: period.from,
            until: period.until,
          });
        }
      } catch {
        // Fallback to existing support prop if request fails
      } finally {
        if (!isCancelled) setLoadingDetail(false);
      }
    };

    loadFresh();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, support, navigate]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !saving) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, saving, onClose]);

  if (!isOpen || !support) return null;

  const handleSave = async () => {
    setError('');

    if (form.disponibilidad === 'reservado') {
      if (!form.from || !form.until) {
        setError('Para marcar el soporte como reservado, completá Desde y Hasta.');
        return;
      }
      if (form.until < form.from) {
        setError('La fecha Hasta no puede ser anterior a Desde.');
        return;
      }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const availableFrom =
        form.disponibilidad === 'reservado' ? `${form.from}|${form.until}` : null;

      const response = await apiFetch(
        `/api/admin/supports/${encodeURIComponent(support.canonical_id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ disponibilidad: form.disponibilidad, availableFrom }),
        }
      );

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      const json = await response.json();
      if (!response.ok || json.status !== 'success') {
        throw new Error(json.message || 'No se pudo guardar el período.');
      }

      onSuccess(support.canonical_id, form.disponibilidad);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar el período.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reservation-modal-title"
      aria-describedby="reservation-modal-desc"
      className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700 border border-amber-100/80 shrink-0">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                  PERÍODO DE RESERVA
                </span>
                <h2
                  id="reservation-modal-title"
                  className="mt-0.5 text-lg font-bold text-gray-950 truncate leading-snug"
                >
                  {supportName}
                </h2>
                <p className="font-mono text-xs text-gray-400 mt-0.5">
                  {support.canonical_id}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Cerrar modal"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p id="reservation-modal-desc" className="mt-3 text-xs text-gray-500 leading-relaxed">
            Registrá el período comercial vigente. Esto no automatiza la disponibilidad.
          </p>
        </div>

        {/* Body Content */}
        <div className="px-6 py-2 space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700"
            >
              {error}
            </div>
          )}

          {loadingDetail && (
            <div className="flex items-center gap-2 text-xs text-gray-400 py-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Cargando datos vigentes...</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.08em] text-gray-500 mb-1.5">
              Disponibilidad
            </label>
            <select
              value={form.disponibilidad}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  disponibilidad: e.target.value as ReservationForm['disponibilidad'],
                }))
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            >
              <option value="disponible">Disponible</option>
              <option value="reservado">Reservado</option>
            </select>
          </div>

          {form.disponibilidad === 'reservado' && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 space-y-3">
              <div>
                <div className="text-xs font-bold text-gray-900">Período reservado</div>
                <p className="mt-0.5 text-[11px] text-gray-600">
                  Las fechas son parte de la información comercial visible en el inventario.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.08em] text-gray-500 mb-1">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={form.from}
                    onChange={(e) => setForm((current) => ({ ...current, from: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.08em] text-gray-500 mb-1">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={form.until}
                    onChange={(e) => setForm((current) => ({ ...current, until: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              </div>

              {form.from && form.until && (
                <div className="rounded-xl border border-amber-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800">
                  La Card mostrará:{' '}
                  <strong>
                    Reservado desde {displayDate(form.from)} a {displayDate(form.until)}
                  </strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer / Actions */}
        <div className="bg-gray-50/80 px-6 py-4 mt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={onClose}
            className="rounded-xl text-xs font-semibold px-4 py-2"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-xl text-xs font-semibold px-4 py-2 bg-gray-950 hover:bg-gray-800 text-white"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Guardando...</span>
              </span>
            ) : (
              'Guardar período'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
