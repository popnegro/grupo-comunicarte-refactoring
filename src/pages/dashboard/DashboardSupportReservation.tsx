import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { apiFetch } from '../../lib/api';

type ReservationForm = { disponibilidad: 'disponible' | 'reservado'; from: string; until: string };

function parseLegacyPeriod(value: unknown): { from: string; until: string } {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return { from: '', until: '' };
  const [from, until] = raw.split('|');
  return until ? { from: from || '', until: until || '' } : { from: '', until: '' };
}

function displayDate(value: string) {
  if (!value) return '';
  const parts = value.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : value;
}

export default function DashboardSupportReservation() {
  const { canonicalId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [form, setForm] = useState<ReservationForm>({ disponibilidad: 'disponible', from: '', until: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canonicalId) return;
    (async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return navigate('/login');
        const response = await apiFetch(`/api/admin/supports/${encodeURIComponent(canonicalId)}`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await response.json();
        if (response.status === 401) return navigate('/login');
        if (!response.ok || json.status !== 'success') throw new Error(json.message || 'No se pudo cargar el soporte.');
        const data = json.data || {};
        const period = parseLegacyPeriod(data.availableFrom);
        setName(String(data.name || ''));
        setForm({ disponibilidad: data.disponibilidad === 'reservado' ? 'reservado' : 'disponible', from: period.from, until: period.until });
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudo cargar el soporte.');
      } finally {
        setLoading(false);
      }
    })();
  }, [canonicalId, navigate]);

  const save = async () => {
    setError('');
    setMessage('');
    if (!canonicalId) return;
    if (form.disponibilidad === 'reservado') {
      if (!form.from || !form.until) return setError('Para marcar el soporte como reservado, completá Desde y Hasta.');
      if (form.until < form.from) return setError('La fecha Hasta no puede ser anterior a Desde.');
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return navigate('/login');
      const availableFrom = form.disponibilidad === 'reservado' ? `${form.from}|${form.until}` : null;
      const response = await apiFetch(`/api/admin/supports/${encodeURIComponent(canonicalId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ disponibilidad: form.disponibilidad, availableFrom }),
      });
      const json = await response.json();
      if (response.status === 401) return navigate('/login');
      if (!response.ok || json.status !== 'success') throw new Error(json.message || 'No se pudo guardar el período.');
      setMessage('Período de reserva actualizado.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar el período.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardShell><div className="mx-auto max-w-7xl py-16 text-center text-sm text-gray-500">Cargando soporte…</div></DashboardShell>;

  return <DashboardShell>
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button onClick={() => navigate('/dashboard/soportes')} className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-950"><ArrowLeft className="h-4 w-4" />Gestión de Soportes</button>
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700"><CalendarDays className="h-4 w-4" /></div><div><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Período de reserva</div><h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950 md:text-3xl">{name || 'Soporte'}</h1></div></div>
          <p className="mt-2 text-sm text-gray-500">Registrá el período comercial vigente. Esto no automatiza la disponibilidad.</p>
        </div>
      </header>

      {error && <div role="alert" className="border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
      {message && <div role="status" className="border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</div>}

      <section className="border border-gray-200 bg-white p-5">
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">Disponibilidad</label>
            <select className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10" value={form.disponibilidad} onChange={(e) => setForm((current) => ({ ...current, disponibilidad: e.target.value as ReservationForm['disponibilidad'] }))}>
              <option value="disponible">Disponible</option><option value="reservado">Reservado</option>
            </select>
          </div>

          {form.disponibilidad === 'reservado' && <div className="border border-amber-100 bg-amber-50/60 p-4">
            <div className="text-sm font-bold text-gray-900">Período reservado</div>
            <p className="mt-1 text-xs text-gray-600">Las fechas son parte de la información comercial visible en el inventario.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><label className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">Desde</label><input type="date" className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10" value={form.from} onChange={(e) => setForm((current) => ({ ...current, from: e.target.value }))} /></div>
              <div><label className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">Hasta</label><input type="date" className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10" value={form.until} onChange={(e) => setForm((current) => ({ ...current, until: e.target.value }))} /></div>
            </div>
            {form.from && form.until && <div className="mt-4 border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800">La Card mostrará: <strong>Reservado desde {displayDate(form.from)} a {displayDate(form.until)}</strong></div>}
          </div>}

          <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button onClick={() => navigate(`/dashboard/soportes/${encodeURIComponent(canonicalId || '')}/edit`)} className="rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Volver a editar soporte</button>
            <button disabled={saving} onClick={save} className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? 'Guardando…' : 'Guardar período'}</button>
          </div>
        </div>
      </section>
    </div>
  </DashboardShell>;
}
