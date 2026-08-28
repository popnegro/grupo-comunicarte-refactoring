import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Eye, Loader2, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { apiFetch } from '../../lib/api';
import { getSupportEditorThemeConfig } from './supportEditorThemes';

type ThemeKey = 'traditional' | 'led' | 'led_mobile';

type FormState = {
  name: string;
  ciudad: string;
  tipo_soporte: 'tradicional' | 'led' | 'led_movil';
  active: boolean;
  disponibilidad: 'disponible' | 'reservado';
  isFeatured: boolean;
  address: string;
  lat: string;
  lng: string;
  mapa_url: string;
  description: string;
  characteristics: string;
  imageUrls: string;
  technical: {
    summary: string;
    measures: string;
    resolution: string;
    turn_on_schedule: string;
    daily_frequency: string;
    requirements: string;
    spot_duration_seconds: string;
    minimum_daily_outings: string;
    max_advertisers: string;
    route_duration_hours: string;
    operation_days: string;
    video_mode: string;
  };
  pricing: {
    exhibition_price: string;
    installation_price: string;
    printing_price: string;
    monthly_price: string;
    exclusive_price: string;
    currency: string;
    tax_included: boolean;
    price_public: boolean;
  };
  route: {
    route_name: string;
    route_mode: string;
    schedule: string;
    duration: string;
    hours: string;
    weekdays: string;
    default_route: boolean;
    max_advertisers: string;
    spot_duration_seconds: string;
    minimum_daily_outings: string;
    routePath: string;
    waypoints: string;
  };
};

const emptyForm: FormState = {
  name: '',
  ciudad: 'mendoza',
  tipo_soporte: 'tradicional',
  active: true,
  disponibilidad: 'disponible',
  isFeatured: false,
  address: '',
  lat: '',
  lng: '',
  mapa_url: '',
  description: '',
  characteristics: '',
  imageUrls: '',
  technical: {
    summary: '', measures: '', resolution: '', turn_on_schedule: '', daily_frequency: '', requirements: '',
    spot_duration_seconds: '', minimum_daily_outings: '', max_advertisers: '', route_duration_hours: '', operation_days: '', video_mode: '',
  },
  pricing: {
    exhibition_price: '', installation_price: '', printing_price: '', monthly_price: '', exclusive_price: '',
    currency: 'ARS', tax_included: false, price_public: false,
  },
  route: {
    route_name: '', route_mode: 'led_mobile', schedule: '', duration: '', hours: '', weekdays: '', default_route: true,
    max_advertisers: '', spot_duration_seconds: '', minimum_daily_outings: '', routePath: '[]', waypoints: '[]',
  },
};

const inputClass = 'mt-1 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100';
const labelClass = 'text-xs font-bold uppercase tracking-[0.08em] text-gray-500';
const sectionClass = 'rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs';

function themeForType(tipo: FormState['tipo_soporte']): ThemeKey {
  return tipo === 'led' ? 'led' : tipo === 'led_movil' ? 'led_mobile' : 'traditional';
}

function text(value: unknown) {
  return value == null ? '' : String(value);
}

function normalize(item: any): FormState {
  const technical = item?.technical || {};
  const pricing = item?.pricing || {};
  const route = item?.route || {};
  const tipo = (item?.tipo_soporte || 'tradicional') as FormState['tipo_soporte'];
  return {
    ...emptyForm,
    name: text(item?.name),
    ciudad: text(item?.ciudad || 'mendoza'),
    tipo_soporte: tipo,
    active: item?.active !== false,
    disponibilidad: item?.disponibilidad === 'reservado' ? 'reservado' : 'disponible',
    isFeatured: item?.isFeatured === true,
    address: text(item?.address),
    lat: text(item?.lat),
    lng: text(item?.lng),
    mapa_url: text(item?.mapa_url),
    description: text(item?.description),
    characteristics: text(item?.characteristics),
    imageUrls: Array.isArray(item?.imageUrls) ? item.imageUrls.join('\n') : '',
    technical: Object.fromEntries(Object.keys(emptyForm.technical).map((key) => [key, text(technical[key])])) as FormState['technical'],
    pricing: Object.fromEntries(Object.keys(emptyForm.pricing).map((key) => [
      key,
      typeof emptyForm.pricing[key as keyof FormState['pricing']] === 'boolean'
        ? Boolean(pricing[key])
        : text(pricing[key] ?? emptyForm.pricing[key as keyof FormState['pricing']]),
    ])) as FormState['pricing'],
    route: {
      ...emptyForm.route,
      route_name: text(route.route_name),
      route_mode: text(route.route_mode || 'led_mobile'),
      schedule: text(route.schedule),
      duration: text(route.duration),
      hours: text(route.hours),
      weekdays: text(route.weekdays),
      default_route: route.default_route ?? true,
      max_advertisers: text(route.max_advertisers),
      spot_duration_seconds: text(route.spot_duration_seconds),
      minimum_daily_outings: text(route.minimum_daily_outings),
      routePath: JSON.stringify(route.routePath || [], null, 2),
      waypoints: JSON.stringify(route.waypoints || [], null, 2),
    },
  };
}

function payloadFrom(form: FormState) {
  const numericTechnical = new Set(['spot_duration_seconds', 'minimum_daily_outings', 'max_advertisers', 'route_duration_hours']);
  const technical = Object.fromEntries(Object.entries(form.technical).map(([key, value]) => [key, numericTechnical.has(key) ? Number(value || 0) : value]));
  const payload: any = {
    name: form.name.trim(),
    ciudad: form.ciudad,
    tipo_soporte: form.tipo_soporte,
    family: themeForType(form.tipo_soporte),
    active: form.active,
    disponibilidad: form.disponibilidad,
    isFeatured: form.isFeatured,
    address: form.address.trim(),
    lat: form.lat === '' ? null : Number(form.lat),
    lng: form.lng === '' ? null : Number(form.lng),
    mapa_url: form.mapa_url.trim(),
    description: form.description.trim(),
    characteristics: form.characteristics.trim(),
    imageUrls: form.imageUrls.split('\n').map((value) => value.trim()).filter(Boolean),
    technical,
    pricing: {
      ...form.pricing,
      exhibition_price: Number(form.pricing.exhibition_price || 0),
      installation_price: Number(form.pricing.installation_price || 0),
      printing_price: Number(form.pricing.printing_price || 0),
      monthly_price: Number(form.pricing.monthly_price || 0),
      exclusive_price: Number(form.pricing.exclusive_price || 0),
    },
  };

  if (form.tipo_soporte === 'led_movil') {
    let routePath: unknown[] = [];
    let waypoints: unknown[] = [];
    try {
      routePath = JSON.parse(form.route.routePath || '[]');
      waypoints = JSON.parse(form.route.waypoints || '[]');
    } catch {
      throw new Error('Ruta inválida: Route Path y Waypoints deben contener JSON válido.');
    }
    payload.route = {
      ...form.route,
      max_advertisers: Number(form.route.max_advertisers || 0),
      spot_duration_seconds: Number(form.route.spot_duration_seconds || 0),
      minimum_daily_outings: Number(form.route.minimum_daily_outings || 0),
      routePath,
      waypoints,
    };
  }

  return payload;
}

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <div><label className={labelClass}>{label}</label><input className={inputClass} type={type} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

function TextArea({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return <div><label className={labelClass}>{label}</label><textarea className={`${inputClass} resize-y`} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

export default function DashboardSupportThemedEditor({ mode: explicitMode }: { mode?: 'create' | 'edit' }) {
  const { canonicalId } = useParams();
  const navigate = useNavigate();
  const mode = explicitMode || (canonicalId ? 'edit' : 'create');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (mode !== 'edit' || !canonicalId) return;
    (async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return navigate('/login');
        const response = await apiFetch(`/api/admin/supports/${encodeURIComponent(canonicalId)}`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await response.json();
        if (response.status === 401) return navigate('/login');
        if (!response.ok || json.status !== 'success') throw new Error(json.message || 'No se pudo cargar el soporte.');
        setForm(normalize(json.data));
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudo cargar el soporte.');
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, canonicalId, navigate]);

  const theme = useMemo(() => getSupportEditorThemeConfig(form.tipo_soporte), [form.tipo_soporte]);
  const set = (patch: Partial<FormState>) => setForm((current) => ({ ...current, ...patch }));
  const setNested = (key: 'technical' | 'pricing' | 'route', patch: any) => setForm((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
  const invalid = form.name.trim().length < 2 || !form.ciudad || !form.tipo_soporte;

  const save = async () => {
    setError(''); setSaved(false);
    if (invalid) { setError('Completá al menos nombre, plaza y tipo de soporte.'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return navigate('/login');
      const url = mode === 'create' ? '/api/admin/supports' : `/api/admin/supports/${encodeURIComponent(canonicalId || '')}`;
      const response = await apiFetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payloadFrom(form)),
      });
      const json = await response.json();
      if (response.status === 401) return navigate('/login');
      if (!response.ok || json.status !== 'success') throw new Error(json.message || 'No se pudo guardar el soporte.');
      setSaved(true);
      const id = json.data?.canonical_id || json.data?.canonicalId || canonicalId;
      if (id) navigate(`/dashboard/soportes/${encodeURIComponent(id)}/edit`, { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar el soporte.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardShell><div className="mx-auto max-w-5xl py-20 text-center text-sm text-gray-500">Cargando soporte…</div></DashboardShell>;

  return <DashboardShell>
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button onClick={() => navigate('/dashboard/soportes')} className="mb-3 inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Gestión de Soportes</button>
          <div className="text-eyebrow text-emerald-700">{mode === 'create' ? 'ALTA DE PRODUCTO' : 'EDICIÓN DE PRODUCTO'} · {theme.label}</div>
          <h1 className="mt-2 text-page-title text-gray-900">{mode === 'create' ? 'Nuevo soporte' : form.name || 'Editar soporte'}</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Editor orientado al producto publicado: primero lo que ve el cliente, después la información específica del soporte.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canonicalId && <button onClick={() => navigate(`/dashboard/soportes/${encodeURIComponent(canonicalId)}/preview`)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700"><Eye className="h-4 w-4" /> Vista previa</button>}
          <button onClick={() => navigate('/dashboard/soportes')} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700">Cancelar</button>
          <button disabled={saving} onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Guardando…' : mode === 'create' ? 'Crear soporte' : 'Guardar cambios'}</button>
        </div>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
      {saved && <div role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">Soporte guardado correctamente.</div>}

      <section className={sectionClass}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div><div className="text-eyebrow text-gray-500">01 · PRODUCTO</div><h2 className="mt-1 text-lg font-bold text-gray-900">Identidad y publicación</h2></div>
          <div className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-600">{theme.id.replace('theme_', '').replace('_', ' ')}</div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2"><Field label="Nombre *" value={form.name} onChange={(value) => set({ name: value })} /></div>
          <div><label className={labelClass}>Plaza *</label><select className={inputClass} value={form.ciudad} onChange={(event) => set({ ciudad: event.target.value })}><option value="mendoza">Mendoza</option><option value="buenos-aires">Buenos Aires</option></select></div>
          <div><label className={labelClass}>Tipo *</label><select className={inputClass} value={form.tipo_soporte} onChange={(event) => set({ tipo_soporte: event.target.value as FormState['tipo_soporte'] })}><option value="tradicional">Tradicional</option><option value="led">LED</option><option value="led_movil">LED móvil</option></select></div>
          <div><label className={labelClass}>Disponibilidad</label><select className={inputClass} value={form.disponibilidad} onChange={(event) => set({ disponibilidad: event.target.value as FormState['disponibilidad'] })}><option value="disponible">Disponible</option><option value="reservado">Reservado</option></select></div>
          <div><label className={labelClass}>Publicación</label><select className={inputClass} value={form.active ? 'active' : 'archived'} onChange={(event) => set({ active: event.target.value === 'active' })}><option value="active">Publicado</option><option value="archived">Archivado</option></select></div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="text-eyebrow text-gray-500">02 · PUBLICACIÓN</div><h2 className="mt-1 text-lg font-bold text-gray-900">Lo que verá el cliente</h2>
        <div className="mt-5 grid gap-4">
          <TextArea label="Descripción" value={form.description} onChange={(value) => set({ description: value })} rows={4} />
          <TextArea label="Características" value={form.characteristics} onChange={(value) => set({ characteristics: value })} rows={4} />
          <TextArea label="Imágenes · una URL por línea · primera = portada" value={form.imageUrls} onChange={(value) => set({ imageUrls: value })} rows={4} />
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-xs text-gray-600"><strong>Atributos recomendados para la Card:</strong> {theme.recommendedCardAttributes.join(' · ')}. La selección explícita de atributos quedará como siguiente capa del editor.</div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="text-eyebrow text-gray-500">03 · UBICACIÓN</div><h2 className="mt-1 text-lg font-bold text-gray-900">Dónde está</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2"><Field label="Dirección" value={form.address} onChange={(value) => set({ address: value })} /></div>
          <Field label="Latitud" value={form.lat} onChange={(value) => set({ lat: value })} type="number" />
          <Field label="Longitud" value={form.lng} onChange={(value) => set({ lng: value })} type="number" />
          <div className="md:col-span-2"><Field label="Referencia / URL de mapa" value={form.mapa_url} onChange={(value) => set({ mapa_url: value })} /></div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="text-eyebrow text-gray-500">04 · {theme.label.toUpperCase()}</div><h2 className="mt-1 text-lg font-bold text-gray-900">Información específica</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {theme.family === 'traditional' && <>
            <Field label="Medidas" value={form.technical.measures} onChange={(value) => setNested('technical', { measures: value })} />
            <Field label="Resumen técnico" value={form.technical.summary} onChange={(value) => setNested('technical', { summary: value })} />
            <Field label="Requisitos" value={form.technical.requirements} onChange={(value) => setNested('technical', { requirements: value })} />
            <Field label="Días de operación" value={form.technical.operation_days} onChange={(value) => setNested('technical', { operation_days: value })} />
          </>}
          {theme.family === 'led' && <>
            <Field label="Medidas" value={form.technical.measures} onChange={(value) => setNested('technical', { measures: value })} />
            <Field label="Resolución" value={form.technical.resolution} onChange={(value) => setNested('technical', { resolution: value })} />
            <Field label="Frecuencia diaria" value={form.technical.daily_frequency} onChange={(value) => setNested('technical', { daily_frequency: value })} />
            <Field label="Horario de encendido" value={form.technical.turn_on_schedule} onChange={(value) => setNested('technical', { turn_on_schedule: value })} />
            <Field label="Modo de video" value={form.technical.video_mode} onChange={(value) => setNested('technical', { video_mode: value })} />
            <Field label="Duración del spot · segundos" value={form.technical.spot_duration_seconds} onChange={(value) => setNested('technical', { spot_duration_seconds: value })} type="number" />
            <div className="md:col-span-2"><Field label="Requisitos técnicos" value={form.technical.requirements} onChange={(value) => setNested('technical', { requirements: value })} /></div>
          </>}
          {theme.family === 'led_mobile' && <>
            <Field label="Medidas" value={form.technical.measures} onChange={(value) => setNested('technical', { measures: value })} />
            <Field label="Resolución" value={form.technical.resolution} onChange={(value) => setNested('technical', { resolution: value })} />
            <Field label="Frecuencia diaria" value={form.technical.daily_frequency} onChange={(value) => setNested('technical', { daily_frequency: value })} />
            <Field label="Duración del spot · segundos" value={form.technical.spot_duration_seconds} onChange={(value) => setNested('technical', { spot_duration_seconds: value })} type="number" />
            <Field label="Salidas mínimas" value={form.technical.minimum_daily_outings} onChange={(value) => setNested('technical', { minimum_daily_outings: value })} type="number" />
            <Field label="Máximo de anunciantes" value={form.technical.max_advertisers} onChange={(value) => setNested('technical', { max_advertisers: value })} type="number" />
            <Field label="Modo de video" value={form.technical.video_mode} onChange={(value) => setNested('technical', { video_mode: value })} />
          </>}
        </div>
      </section>

      {theme.family === 'led_mobile' && <section className={sectionClass}>
        <div className="text-eyebrow text-gray-500">05 · OPERACIÓN Y RECORRIDO</div><h2 className="mt-1 text-lg font-bold text-gray-900">Programación de la unidad móvil</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Nombre de ruta" value={form.route.route_name} onChange={(value) => setNested('route', { route_name: value })} />
          <Field label="Modalidad" value={form.route.route_mode} onChange={(value) => setNested('route', { route_mode: value })} />
          <Field label="Horario" value={form.route.schedule} onChange={(value) => setNested('route', { schedule: value })} />
          <Field label="Duración" value={form.route.duration} onChange={(value) => setNested('route', { duration: value })} />
          <Field label="Días" value={form.route.weekdays} onChange={(value) => setNested('route', { weekdays: value })} />
          <Field label="Horas operativas" value={form.route.hours} onChange={(value) => setNested('route', { hours: value })} />
          <details className="md:col-span-2 rounded-xl border border-gray-200 p-4"><summary className="cursor-pointer text-sm font-bold text-gray-800">Datos avanzados de ruta</summary><div className="mt-4 grid gap-4 md:grid-cols-2"><TextArea label="Waypoints JSON" value={form.route.waypoints} onChange={(value) => setNested('route', { waypoints: value })} rows={7} /><TextArea label="Route Path JSON" value={form.route.routePath} onChange={(value) => setNested('route', { routePath: value })} rows={7} /></div></details>
        </div>
      </section>}

      <section className={sectionClass}>
        <div className="text-eyebrow text-gray-500">{theme.family === 'led_mobile' ? '06' : '05'} · COMERCIAL</div><h2 className="mt-1 text-lg font-bold text-gray-900">Pricing interno</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Field label="Exhibición" value={form.pricing.exhibition_price} onChange={(value) => setNested('pricing', { exhibition_price: value })} type="number" />
          <Field label="Instalación" value={form.pricing.installation_price} onChange={(value) => setNested('pricing', { installation_price: value })} type="number" />
          <Field label="Impresión" value={form.pricing.printing_price} onChange={(value) => setNested('pricing', { printing_price: value })} type="number" />
          <Field label="Mensual" value={form.pricing.monthly_price} onChange={(value) => setNested('pricing', { monthly_price: value })} type="number" />
          <Field label="Exclusivo" value={form.pricing.exclusive_price} onChange={(value) => setNested('pricing', { exclusive_price: value })} type="number" />
          <div><label className={labelClass}>Moneda</label><select className={inputClass} value={form.pricing.currency} onChange={(event) => setNested('pricing', { currency: event.target.value })}><option value="ARS">ARS</option><option value="USD">USD</option></select></div>
        </div>
      </section>

      <footer className="sticky bottom-4 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-gray-500">Theme activo: <strong>{theme.label}</strong> · Los datos avanzados permanecen disponibles sin ocupar el flujo principal.</div>
        <div className="flex gap-2"><button onClick={() => navigate('/dashboard/soportes')} className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700">Cancelar</button><button disabled={saving} onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? 'Guardando…' : mode === 'create' ? 'Crear soporte' : 'Guardar cambios'}</button></div>
      </footer>
    </div>
  </DashboardShell>;
}
