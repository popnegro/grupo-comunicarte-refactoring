import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Eye, Save, Info, MapPin, Sparkles, DollarSign } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { SupportCard } from '../../components/inventory/SupportCard';
import { MultimediaUploadZone } from '../../components/inventory/MultimediaUploadZone';
import { apiFetch } from '../../lib/api';
import { getSupportEditorThemeConfig } from './supportEditorThemes';
import { calculateSupportTotal, formatSupportCurrency } from '../../lib/supportPricing';
import type { InventoryItem, MobileRoute, SupportFamily } from '../../types';

type SupportType = 'tradicional' | 'led' | 'led_movil';
type MediaKind = 'image' | 'video';
type Plaza = 'mendoza' | 'buenos-aires';

type FormState = {
  publicName: string;
  ciudad: Plaza;
  tipo_soporte: SupportType;
  active: boolean;
  disponibilidad: 'disponible' | 'reservado';
  isFeatured: boolean;
  address: string;
  lat: string;
  lng: string;
  mapa_url: string;
  description: string;
  coverUrl: string;
  coverKind: MediaKind;
  restMedia: string[];
  traditional: { formato: string; medidas: string; caras: string; impresion: string };
  led: { formato: string; medidas: string; resolucion: string; frecuencia: string; video_mode: string; spot_duration: string };
  mobile: { pantalla: string; resolucion: string; spot_duration: string; minimum_daily_outings: string; recorrido: string; operation_days: string };
  pricing: { exhibition: string; installation: string; printing: string; monthly: string; exclusive: string; currency: string };
  reservedFrom: string;
  reservedUntil: string;
};

const emptyForm: FormState = {
  publicName: '', ciudad: 'mendoza', tipo_soporte: 'tradicional', active: true, disponibilidad: 'disponible', isFeatured: false,
  address: '', lat: '', lng: '', mapa_url: '', description: '', coverUrl: '', coverKind: 'image', restMedia: [],
  traditional: { formato: '', medidas: '', caras: '', impresion: '' },
  led: { formato: '', medidas: '', resolucion: '', frecuencia: '', video_mode: '', spot_duration: '' },
  mobile: { pantalla: '', resolucion: '', spot_duration: '', minimum_daily_outings: '', recorrido: '', operation_days: '' },
  pricing: { exhibition: '', installation: '', printing: '', monthly: '', exclusive: '', currency: 'ARS' },
  reservedFrom: '', reservedUntil: '',
};

const inputClass = 'mt-1 h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10';
const textareaClass = 'mt-1 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-gray-500';
const sectionClass = 'rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs';
const familyFor = (type: SupportType): SupportFamily => type === 'led' ? 'led' : type === 'led_movil' ? 'led_mobile' : 'traditional';
const text = (v: unknown) => v == null ? '' : String(v);
const splitPeriod = (v: unknown) => { if (typeof v !== 'string' || !v) return { from: '', until: '' }; const [from, until] = v.split('|'); return { from: from || '', until: until || '' }; };

function extractCoordsFromUrl(text: string): { lat: string; lng: string } | null {
  const cleanText = text.trim();
  if (!cleanText) return null;

  // 1. Direct coordinates match
  const directMatch = cleanText.match(/^([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)$/);
  if (directMatch) {
    return { lat: directMatch[1], lng: directMatch[2] };
  }

  // 2. @lat,lng match
  const atMatch = cleanText.match(/@([+-]?\d+(?:\.\d+)?),([+-]?\d+(?:\.\d+)?)/);
  if (atMatch) {
    return { lat: atMatch[1], lng: atMatch[2] };
  }

  // 3. query param match
  const queryMatch = cleanText.match(/[?&](?:q|query|loc|location)=([+-]?\d+(?:\.\d+)?),([+-]?\d+(?:\.\d+)?)/);
  if (queryMatch) {
    return { lat: queryMatch[1], lng: queryMatch[2] };
  }

  // 4. generic coordinates pair search
  const genericMatch = cleanText.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (genericMatch) {
    return { lat: genericMatch[1], lng: genericMatch[2] };
  }

  return null;
}

function normalize(item: any): FormState {
  const technical = item?.technical || {}; const pricing = item?.pricing || {}; const route = item?.route || {};
  const images = Array.isArray(item?.imageUrls) ? item.imageUrls.map(String).filter(Boolean) : [];
  const period = splitPeriod(item?.availableFrom);
  return {
    ...emptyForm,
    publicName: text(item?.name), ciudad: (item?.ciudad || 'mendoza') as Plaza, tipo_soporte: (item?.tipo_soporte || 'tradicional') as SupportType,
    active: item?.active !== false, disponibilidad: item?.disponibilidad === 'reservado' ? 'reservado' : 'disponible', isFeatured: item?.isFeatured === true,
    address: text(item?.address), lat: text(item?.lat), lng: text(item?.lng), mapa_url: text(item?.mapa_url), description: text(item?.description),
    coverUrl: images[0] || '', coverKind: technical?.metadata?.cover_media_type === 'video' ? 'video' : 'image', restMedia: images.slice(1, 3),
    traditional: { formato: text(technical.formato || technical.format), medidas: text(technical.measures), caras: text(technical.caras), impresion: text(technical.impresion) },
    led: { formato: text(technical.formato || technical.format), medidas: text(technical.measures), resolucion: text(technical.resolution), frecuencia: text(technical.daily_frequency), video_mode: text(technical.video_mode), spot_duration: text(technical.spot_duration_seconds) },
    mobile: { pantalla: text(technical.pantalla || technical.measures), resolucion: text(technical.resolution), spot_duration: text(technical.spot_duration_seconds), minimum_daily_outings: text(technical.minimum_daily_outings), recorrido: text(route.route_name || route.schedule || technical.summary), operation_days: text(technical.operation_days || route.weekdays) },
    pricing: { exhibition: text(pricing.exhibition_price), installation: text(pricing.installation_price), printing: text(pricing.printing_price), monthly: text(pricing.monthly_price), exclusive: text(pricing.exclusive_price), currency: text(pricing.currency || 'ARS') },
    reservedFrom: text(item?.reservedFrom || period.from), reservedUntil: text(item?.reservedUntil || period.until),
  };
}

function payloadFrom(form: FormState) {
  if (form.publicName.trim().length < 2) throw new Error('Completá el Nombre público del soporte.');
  if (form.disponibilidad === 'reservado' && (!form.reservedFrom || !form.reservedUntil)) throw new Error('Para un soporte reservado, completá Desde y Hasta.');
  if (form.disponibilidad === 'reservado' && form.reservedUntil < form.reservedFrom) throw new Error('La fecha Hasta no puede ser anterior a Desde.');
  let technical: any = {};
  if (form.tipo_soporte === 'tradicional') technical = { summary: form.traditional.formato, measures: form.traditional.medidas, formato: form.traditional.formato, caras: Number(form.traditional.caras || 0), impresion: form.traditional.impresion };
  if (form.tipo_soporte === 'led') technical = { summary: form.led.formato, measures: form.led.medidas, formato: form.led.formato, resolution: form.led.resolucion, daily_frequency: form.led.frecuencia, video_mode: form.led.video_mode, spot_duration_seconds: Number(form.led.spot_duration || 0) };
  if (form.tipo_soporte === 'led_movil') technical = { summary: form.mobile.pantalla, measures: form.mobile.pantalla, resolution: form.mobile.resolucion, spot_duration_seconds: Number(form.mobile.spot_duration || 0), minimum_daily_outings: Number(form.mobile.minimum_daily_outings || 0), operation_days: form.mobile.operation_days };
  technical.metadata = { cover_media_type: form.coverKind };
  return {
    name: form.publicName.trim(), ciudad: form.ciudad, tipo_soporte: form.tipo_soporte, family: familyFor(form.tipo_soporte), active: form.active,
    disponibilidad: form.disponibilidad, availableFrom: form.disponibilidad === 'reservado' ? `${form.reservedFrom}|${form.reservedUntil}` : null,
    isFeatured: form.isFeatured, address: form.address.trim(), lat: form.lat === '' ? null : Number(form.lat), lng: form.lng === '' ? null : Number(form.lng), mapa_url: form.mapa_url.trim(), description: form.description.trim(),
    imageUrls: [form.coverUrl, ...form.restMedia].map((v) => v.trim()).filter(Boolean).slice(0, 3), technical,
    pricing: { exhibition_price: Number(form.pricing.exhibition || 0), installation_price: Number(form.pricing.installation || 0), printing_price: Number(form.pricing.printing || 0), monthly_price: Number(form.pricing.monthly || 0), exclusive_price: Number(form.pricing.exclusive || 0), currency: form.pricing.currency },
    ...(form.tipo_soporte === 'led_movil' ? { route: { route_name: form.mobile.recorrido, schedule: form.mobile.operation_days, route_mode: 'led_mobile', routePath: [], waypoints: [] } } : {}),
  };
}

function Field({ label, value, onChange, type = 'text', placeholder, readOnly = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; readOnly?: boolean }) {
  return <div><label className={labelClass}>{label}</label><input readOnly={readOnly} className={`${inputClass}${readOnly ? ' bg-gray-50 text-gray-500' : ''}`} type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}
function BadgeField({ label, value }: { label: string; value: string }) {
  return value ? <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-800"><span className="mr-1.5 text-gray-500">{label}</span>{value}</span> : null;
}

type EditorTab = 'general' | 'location' | 'content' | 'commercial';

export default function DashboardSupportProductEditor({ mode: explicitMode }: { mode?: 'create' | 'edit' }) {
  const { canonicalId } = useParams(); const navigate = useNavigate(); const mode = explicitMode || (canonicalId ? 'edit' : 'create');
  const [form, setForm] = useState<FormState>(emptyForm); const [loading, setLoading] = useState(mode === 'edit'); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<EditorTab>('general');

  const [baseline, setBaseline] = useState<FormState>(emptyForm);
  const [coordHelperVal, setCoordHelperVal] = useState('');
  const [coordHelperError, setCoordHelperError] = useState('');
  const [coordHelperSuccess, setCoordHelperSuccess] = useState(false);

  useEffect(() => {
    if (mode !== 'edit' || !canonicalId) {
      setBaseline(emptyForm);
      return;
    }
    (async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return navigate('/login');
        const r = await apiFetch(`/api/admin/supports/${encodeURIComponent(canonicalId)}`, { headers: { Authorization: `Bearer ${token}` } });
        const j = await r.json();
        if (r.status === 401) return navigate('/login');
        if (!r.ok || j.status !== 'success') throw new Error(j.message || 'No se pudo cargar el soporte.');
        const normalized = normalize(j.data);
        setForm(normalized);
        setBaseline(normalized);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo cargar el soporte.');
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, canonicalId, navigate]);
  const theme = useMemo(() => getSupportEditorThemeConfig(form.tipo_soporte), [form.tipo_soporte]);
  const pricingTotal = useMemo(() => calculateSupportTotal({
    exhibition_price: form.pricing.exhibition,
    installation_price: form.pricing.installation,
    printing_price: form.pricing.printing,
  }), [form.pricing.exhibition, form.pricing.installation, form.pricing.printing]);

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(baseline), [form, baseline]);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const handleInternalNavigationClick = (e: MouseEvent) => {
      // HLZ-02: Do not intercept modifier clicks or middle clicks (standard browser alternate navigation)
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
        return;
      }
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && (href.startsWith('/') || href.startsWith('http'))) {
          const isCurrentEdit = canonicalId && href.includes(`/dashboard/soportes/${canonicalId}/edit`);
          const isCurrentPreview = canonicalId && href.includes(`/dashboard/soportes/${canonicalId}/preview`);
          if (isCurrentEdit || isCurrentPreview) return;

          const confirmDiscard = window.confirm('¿Descartar cambios? Tenés modificaciones sin guardar. Si salís ahora, perderás todo el trabajo realizado.');
          if (!confirmDiscard) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };
    document.addEventListener('click', handleInternalNavigationClick, true);
    return () => document.removeEventListener('click', handleInternalNavigationClick, true);
  }, [isDirty, canonicalId]);

  const handleNavigateWithConfirm = (targetPath: string) => {
    if (isDirty) {
      const confirmDiscard = window.confirm('¿Descartar cambios? Tenés modificaciones sin guardar. Si salís ahora, perderás todo el trabajo realizado.');
      if (!confirmDiscard) return;
    }
    navigate(targetPath);
  };
  const set = (patch: Partial<FormState>) => setForm((c) => ({ ...c, ...patch }));
  const setNested = (key: 'traditional' | 'led' | 'mobile' | 'pricing', patch: any) => setForm((c) => ({ ...c, [key]: { ...c[key], ...patch } }));
  const addRest = () => form.restMedia.length < 2 && set({ restMedia: [...form.restMedia, ''] });
  const updateRest = (i: number, v: string) => set({ restMedia: form.restMedia.map((x, n) => n === i ? v : x) });
  const removeRest = (i: number) => set({ restMedia: form.restMedia.filter((_, n) => n !== i) });
  const previewItem = useMemo<InventoryItem>(() => {
    const family = familyFor(form.tipo_soporte); const technical: any = form.tipo_soporte === 'tradicional'
      ? { measures: form.traditional.medidas, summary: form.traditional.formato, caras: Number(form.traditional.caras || 0), impresion: form.traditional.impresion }
      : form.tipo_soporte === 'led'
        ? { measures: form.led.medidas, resolution: form.led.resolucion, daily_frequency: form.led.frecuencia, metadata: { cover_media_type: form.coverKind } }
        : { measures: form.mobile.pantalla, resolution: form.mobile.resolucion, spot_duration_seconds: Number(form.mobile.spot_duration || 0), minimum_daily_outings: Number(form.mobile.minimum_daily_outings || 0), metadata: { cover_media_type: form.coverKind } };
    const base: any = { canonical_id: canonicalId || 'preview', name: form.publicName || 'Nombre público', ciudad: form.ciudad, tipo_soporte: form.tipo_soporte, family, active: form.active, description: form.description, characteristics: form.tipo_soporte === 'tradicional' ? form.traditional.impresion : form.tipo_soporte === 'led' ? form.led.video_mode : form.mobile.recorrido, mapa_url: form.mapa_url, imageUrls: [form.coverUrl, ...form.restMedia].filter(Boolean).slice(0, 3), disponibilidad: form.disponibilidad, availableFrom: form.disponibilidad === 'reservado' ? `${form.reservedFrom}|${form.reservedUntil}` : undefined, reservedFrom: form.disponibilidad === 'reservado' ? form.reservedFrom : undefined, reservedUntil: form.disponibilidad === 'reservado' ? form.reservedUntil : undefined, address: form.address || 'Ubicación del soporte', isFeatured: form.isFeatured, technical };
    return family === 'led_mobile' ? { ...base, routePath: [], waypoints: [], schedule: form.mobile.operation_days, duration: form.mobile.recorrido } as MobileRoute : base as InventoryItem;
  }, [canonicalId, form]);
  const save = async () => {
    setError('');
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return navigate('/login');
      const payload = payloadFrom(form);
      const url = mode === 'create' ? '/api/admin/supports' : `/api/admin/supports/${encodeURIComponent(canonicalId || '')}`;
      const r = await apiFetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const j = await r.json();
      if (r.status === 401) return navigate('/login');
      if (!r.ok || j.status !== 'success') throw new Error(j.message || 'No se pudo guardar el soporte.');

      const id = j.data?.canonical_id || canonicalId;
      if (id) {
        // HLZ-01: Update form and baseline to match the newly saved state to reset isDirty to false BEFORE navigating
        const savedForm = j.data ? normalize(j.data) : form;
        setForm(savedForm);
        setBaseline(savedForm);

        navigate(`/dashboard/soportes/${encodeURIComponent(id)}/edit`, { replace: true });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el soporte.');
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <DashboardShell><div className="mx-auto max-w-5xl py-20 text-center text-sm text-gray-500">Cargando soporte…</div></DashboardShell>;
  const typeLabel = form.tipo_soporte === 'led_movil' ? 'LED móvil' : form.tipo_soporte === 'led' ? 'LED' : 'Tradicional';
  return <DashboardShell><div className="mx-auto max-w-7xl space-y-5 pb-14">
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><button onClick={() => handleNavigateWithConfirm('/dashboard/soportes')} className="mb-2 inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 min-h-[44px] sm:min-h-0"><ArrowLeft className="h-4 w-4"/> Gestión de Soportes</button><div className="text-eyebrow text-emerald-700">{mode === 'create' ? 'ALTA DE PRODUCTO' : 'EDICIÓN DE PRODUCTO'} · {theme.label}</div><h1 className="mt-2 text-page-title text-gray-900">{mode === 'create' ? 'Nuevo soporte' : form.publicName || 'Editar soporte'}</h1></div><div className="flex flex-wrap gap-2">{canonicalId && <button onClick={() => handleNavigateWithConfirm(`/dashboard/soportes/${encodeURIComponent(canonicalId)}/preview`)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 min-h-[44px] sm:min-h-[40px]"><Eye className="h-4 w-4"/> Preview completa</button>}<button onClick={() => handleNavigateWithConfirm('/dashboard/soportes')} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 min-h-[44px] sm:min-h-[40px]">Cancelar</button><button disabled={saving} onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50 min-h-[44px] sm:min-h-[40px]"><Save className="h-4 w-4"/>{saving ? 'Guardando…' : mode === 'create' ? 'Crear soporte' : 'Guardar cambios'}</button></div></header>
    {error && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

    {/* Navigation Tabs Menu */}
    <div className="border-b border-gray-200">
      <div role="tablist" aria-label="Secciones del editor" className="flex flex-nowrap overflow-x-auto gap-2 pb-2 scrollbar-none">
        {[
          { id: 'general', label: 'Información General', icon: Info },
          { id: 'location', label: 'Ubicación Física', icon: MapPin },
          { id: 'content', label: 'Contenido y Atributos', icon: Sparkles },
          { id: 'commercial', label: 'Comercial y Fechas', icon: DollarSign },
        ].map((t, idx, arr) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              const nextIndex = (idx + 1) % arr.length;
              setActiveTab(arr[nextIndex].id as EditorTab);
              document.getElementById(`editor-tab-${arr[nextIndex].id}`)?.focus();
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              const prevIndex = (idx - 1 + arr.length) % arr.length;
              setActiveTab(arr[prevIndex].id as EditorTab);
              document.getElementById(`editor-tab-${arr[prevIndex].id}`)?.focus();
            } else if (e.key === 'Home') {
              e.preventDefault();
              setActiveTab(arr[0].id as EditorTab);
              document.getElementById(`editor-tab-${arr[0].id}`)?.focus();
            } else if (e.key === 'End') {
              e.preventDefault();
              setActiveTab(arr[arr.length - 1].id as EditorTab);
              document.getElementById(`editor-tab-${arr[arr.length - 1].id}`)?.focus();
            }
          };
          return (
            <button
              key={t.id}
              id={`editor-tab-${t.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`editor-panel-${t.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(t.id as EditorTab)}
              onKeyDown={handleKeyDown}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition focus:outline-none whitespace-nowrap min-h-[44px] sm:min-h-0 ${
                isActive
                  ? 'border-gray-950 text-gray-950'
                  : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>

    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
      <div className="space-y-5">

        {/* PANEL 1: Información General */}
        <div
          id="editor-panel-general"
          role="tabpanel"
          aria-labelledby="editor-tab-general"
          className={activeTab === 'general' ? 'block' : 'hidden'}
        >
          <section className={sectionClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-eyebrow text-gray-500">INFORMACIÓN GENERAL</div>
                <h2 className="mt-1 text-lg font-bold text-gray-900">Datos básicos del soporte</h2>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">{typeLabel}</span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Tipología *</label>
                <select className={inputClass} value={form.tipo_soporte} onChange={(e) => set({ tipo_soporte: e.target.value as SupportType })}>
                  <option value="tradicional">Tradicional</option>
                  <option value="led">LED</option>
                  <option value="led_movil">LED móvil</option>
                </select>
              </div>
              <Field label="Soporte ID · uso interno" value={canonicalId || 'Se genera al guardar'} onChange={() => undefined} readOnly/>
              <div>
                <label className={labelClass}>Plaza *</label>
                <select className={inputClass} value={form.ciudad} onChange={(e) => set({ ciudad: e.target.value as Plaza })}>
                  <option value="mendoza">Mendoza</option>
                  <option value="buenos-aires">Buenos Aires</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Field label="Nombre público *" value={form.publicName} onChange={(v) => set({ publicName: v })} placeholder="Ej. Soporte San Juan y San Martín"/>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Descripción · máximo 250 caracteres</label>
                <textarea className={`${textareaClass} min-h-28`} maxLength={250} value={form.description} onChange={(e) => set({ description: e.target.value })}/>
                <div className="mt-1 text-right text-xs text-gray-500">{form.description.length}/250</div>
              </div>
            </div>
          </section>
        </div>

        {/* PANEL 2: Ubicación Física */}
        <div
          id="editor-panel-location"
          role="tabpanel"
          aria-labelledby="editor-tab-location"
          className={activeTab === 'location' ? 'block' : 'hidden'}
        >
          <section className={sectionClass}>
            <div>
              <div className="text-eyebrow text-gray-500">UBICACIÓN FÍSICA</div>
              <h2 className="mt-1 text-lg font-bold text-gray-900">Georreferenciación y dirección</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Ubicación" value={form.address} onChange={(v) => set({ address: v })} placeholder="Ej. San Juan 230"/>
              </div>
              <Field label="Latitud" value={form.lat} onChange={(v) => set({ lat: v })}/>
              <Field label="Longitud" value={form.lng} onChange={(v) => set({ lng: v })}/>

              <div className="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className={labelClass}>Asistente de Coordenadas</div>
                  <span className="text-[10px] font-bold text-gray-400">Google Maps / Coords</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Pegá un enlace de Google Maps (que contenga <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800 text-[11px] font-mono">@latitud,longitud</code>) o coordenadas para autocompletar.
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Pegá la URL de Maps o coordenadas aquí..."
                    className={`${inputClass} flex-1`}
                    value={coordHelperVal}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCoordHelperVal(val);
                      setCoordHelperError('');
                      setCoordHelperSuccess(false);
                      if (!val) return;
                      const coords = extractCoordsFromUrl(val);
                      if (coords) {
                        const latNum = Number(coords.lat);
                        const lngNum = Number(coords.lng);
                        if (latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180) {
                          set({ lat: coords.lat, lng: coords.lng });
                          setCoordHelperSuccess(true);
                        } else {
                          setCoordHelperError('Coordenadas fuera de rango (Latitud: -90 a 90, Longitud: -180 a 180).');
                        }
                      } else {
                        setCoordHelperError('No se encontraron coordenadas en el texto copiado.');
                      }
                    }}
                  />
                  {coordHelperVal && (
                    <button
                      type="button"
                      onClick={() => {
                        setCoordHelperVal('');
                        setCoordHelperError('');
                        setCoordHelperSuccess(false);
                      }}
                      className="rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-500 hover:text-gray-900"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                {coordHelperError && (
                  <div className="mt-2 text-xs font-semibold text-red-600">
                    ❌ {coordHelperError}
                  </div>
                )}
                {coordHelperSuccess && (
                  <div className="mt-2 text-xs font-semibold text-emerald-600">
                    ✅ Coordenadas extraídas y aplicadas con éxito.
                  </div>
                )}
                <div className="mt-2 text-[11px] text-gray-500 flex items-start gap-1">
                  <span>💡 <strong>¿Cómo obtenerlas?</strong> En Google Maps de computadora, hacé clic derecho en cualquier punto y hacé clic sobre los números para copiarlos directamente.</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <Field label="Google Maps URL" value={form.mapa_url} onChange={(v) => set({ mapa_url: v })}/>
              </div>
            </div>
          </section>
        </div>

        {/* PANEL 3: Contenido y Atributos */}
        <div
          id="editor-panel-content"
          role="tabpanel"
          aria-labelledby="editor-tab-content"
          className={activeTab === 'content' ? 'block' : 'hidden'}
        >
          <section className={sectionClass}>
            <div>
              <div className="text-eyebrow text-gray-500">CONTENIDO Y ATRIBUTOS</div>
              <h2 className="mt-1 text-lg font-bold text-gray-900">Multimedia y ficha técnica</h2>
            </div>
            <div className="mt-5 space-y-5">
              <MultimediaUploadZone canonicalId={canonicalId} url={form.coverUrl} kind={form.coverKind} label="Portada" description="Foto o video principal del carousel." onUrlChange={(url, kind) => set({ coverUrl: url, coverKind: kind })} onClear={() => set({ coverUrl: '', coverKind: 'image' })} />
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={labelClass}>Resto multimedia</div>
                    <p className="mt-1 text-xs text-gray-500">Hasta 2 recursos adicionales.</p>
                  </div>
                  <button type="button" onClick={addRest} disabled={form.restMedia.length >= 2} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 disabled:opacity-50 min-h-[44px] sm:min-h-0">+ Cargar más</button>
                </div>
                <div className="mt-4 space-y-4">
                  {form.restMedia.map((v, i) => <MultimediaUploadZone key={`rest-media-${i}`} canonicalId={canonicalId} url={v} kind={/\.(mp4|webm|mov)(\?|$)/i.test(v) ? 'video' : 'image'} label={`Recurso Adicional ${i + 1}`} description="Imagen o video complementario para la galería." onUrlChange={(url) => updateRest(i, url)} onClear={() => removeRest(i)} />)}
                </div>
              </div>

              {form.tipo_soporte === 'tradicional' && <div className="space-y-3"><div className={labelClass}>Atributos visibles</div><div className="flex flex-wrap gap-2"><BadgeField label="Formato" value={form.traditional.formato}/><BadgeField label="Medidas" value={form.traditional.medidas}/><BadgeField label="Caras" value={form.traditional.caras}/><BadgeField label="Impresión" value={form.traditional.impresion}/></div><div className="grid gap-4 md:grid-cols-2"><Field label="Formato" value={form.traditional.formato} onChange={(v) => setNested('traditional', { formato: v })}/><Field label="Medidas" value={form.traditional.medidas} onChange={(v) => setNested('traditional', { medidas: v })}/><Field label="Caras" value={form.traditional.caras} onChange={(v) => setNested('traditional', { caras: v })}/><Field label="Impresión" value={form.traditional.impresion} onChange={(v) => setNested('traditional', { impresion: v })}/></div></div>}
              {form.tipo_soporte === 'led' && <div className="space-y-3"><div className={labelClass}>Atributos visibles</div><div className="flex flex-wrap gap-2"><BadgeField label="Formato" value={form.led.formato}/><BadgeField label="Medidas" value={form.led.medidas}/><BadgeField label="Resolución" value={form.led.resolucion}/><BadgeField label="Frecuencia" value={form.led.frecuencia}/></div><div className="grid gap-4 md:grid-cols-2"><Field label="Formato" value={form.led.formato} onChange={(v) => setNested('led', { formato: v })}/><Field label="Medidas" value={form.led.medidas} onChange={(v) => setNested('led', { medidas: v })}/><Field label="Resolución" value={form.led.resolucion} onChange={(v) => setNested('led', { resolucion: v })}/><Field label="Frecuencia" value={form.led.frecuencia} onChange={(v) => setNested('led', { frecuencia: v })}/><Field label="Modo de video" value={form.led.video_mode} onChange={(v) => setNested('led', { video_mode: v })}/><Field label="Duración de spot" value={form.led.spot_duration} onChange={(v) => setNested('led', { spot_duration: v })}/></div></div>}
              {form.tipo_soporte === 'led_movil' && <div className="space-y-3"><div className={labelClass}>Atributos visibles</div><div className="flex flex-wrap gap-2"><BadgeField label="Pantalla" value={form.mobile.pantalla}/><BadgeField label="Resolución" value={form.mobile.resolucion}/><BadgeField label="Spot" value={form.mobile.spot_duration}/><BadgeField label="Salidas" value={form.mobile.minimum_daily_outings}/></div><div className="grid gap-4 md:grid-cols-2"><Field label="Pantalla / formato" value={form.mobile.pantalla} onChange={(v) => setNested('mobile', { pantalla: v })}/><Field label="Resolución" value={form.mobile.resolucion} onChange={(v) => setNested('mobile', { resolucion: v })}/><Field label="Duración de spot" value={form.mobile.spot_duration} onChange={(v) => setNested('mobile', { spot_duration: v })}/><Field label="Salidas mínimas" value={form.mobile.minimum_daily_outings} onChange={(v) => setNested('mobile', { minimum_daily_outings: v })}/><Field label="Recorrido" value={form.mobile.recorrido} onChange={(v) => setNested('mobile', { recorrido: v })}/><Field label="Días de operación" value={form.mobile.operation_days} onChange={(v) => setNested('mobile', { operation_days: v })}/></div></div>}

              <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                <div className="text-sm font-bold text-gray-900">¿Publicar como destacado?</div>
                <button type="button" onClick={() => set({ isFeatured: !form.isFeatured })} className={`rounded-full px-4 py-2 text-xs font-bold min-h-[44px] sm:min-h-0 ${form.isFeatured ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{form.isFeatured ? 'Sí' : 'No'}</button>
              </div>
            </div>
          </section>
        </div>

        {/* PANEL 4: Comercial y Fechas */}
        <div
          id="editor-panel-commercial"
          role="tabpanel"
          aria-labelledby="editor-tab-commercial"
          className={activeTab === 'commercial' ? 'block' : 'hidden'}
        >
          <section className={sectionClass}>
            <div>
              <div className="text-eyebrow text-gray-500">COMERCIAL Y FECHAS</div>
              <h2 className="mt-1 text-lg font-bold text-gray-900">Configuración comercial</h2>
            </div>
            <div className="mt-5 space-y-5">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className={labelClass}>Disponibilidad</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => set({ disponibilidad: 'disponible', reservedFrom: '', reservedUntil: '' })} className={`rounded-xl px-4 py-2.5 text-sm font-bold min-h-[44px] sm:min-h-0 ${form.disponibilidad === 'disponible' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500'}`}>Disponible</button>
                  <button type="button" onClick={() => set({ disponibilidad: 'reservado' })} className={`rounded-xl px-4 py-2.5 text-sm font-bold min-h-[44px] sm:min-h-0 ${form.disponibilidad === 'reservado' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500'}`}>Reservado</button>
                </div>
                {form.disponibilidad === 'reservado' && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Desde" type="date" value={form.reservedFrom} onChange={(v) => set({ reservedFrom: v })}/>
                    <Field label="Hasta" type="date" value={form.reservedUntil} onChange={(v) => set({ reservedUntil: v })}/>
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className={labelClass}>Publicación</div>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => set({ active: true })} className={`rounded-xl px-4 py-2.5 text-sm font-bold min-h-[44px] sm:min-h-0 ${form.active ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500'}`}>Publicado</button>
                  <button type="button" onClick={() => set({ active: false })} className={`rounded-xl px-4 py-2.5 text-sm font-bold min-h-[44px] sm:min-h-0 ${!form.active ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500'}`}>Archivado</button>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-5">
                <div className="text-eyebrow text-gray-500">PRICING INTERNO</div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Exhibición" value={form.pricing.exhibition} onChange={(v) => setNested('pricing', { exhibition: v })}/>
                  <Field label="Instalación" value={form.pricing.installation} onChange={(v) => setNested('pricing', { installation: v })}/>
                  {form.tipo_soporte === 'tradicional' && <Field label="Impresión" value={form.pricing.printing} onChange={(v) => setNested('pricing', { printing: v })}/>}
                  <Field label="Mensual" value={form.pricing.monthly} onChange={(v) => setNested('pricing', { monthly: v })}/>
                  {form.tipo_soporte !== 'tradicional' && <Field label="Exclusivo" value={form.pricing.exclusive} onChange={(v) => setNested('pricing', { exclusive: v })}/>}
                  <Field label="Moneda" value={form.pricing.currency} onChange={(v) => setNested('pricing', { currency: v })}/>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
                  <div>
                    <div className={labelClass}>TOTAL SOPORTE</div>
                    <div className="mt-1 text-xs text-gray-500">Exhibición + Instalación + Impresión</div>
                  </div>
                  <div className="text-xl font-extrabold text-emerald-900">{formatSupportCurrency(pricingTotal, form.pricing.currency || 'ARS')}</div>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>

      <aside id="support-card-preview" className="lg:sticky lg:top-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-eyebrow text-gray-500">PREVIEW</div>
              <h2 className="mt-1 text-lg font-bold text-gray-900">Product Card</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">Tiempo real</span>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <SupportCard item={previewItem} variant="catalog" />
          </div>
        </div>
      </aside>
    </div>

    {/* Mobile Preview Floating Button */}
    <div className="fixed bottom-4 right-4 z-50 lg:hidden">
      <button
        type="button"
        onClick={() => {
          const el = document.getElementById('support-card-preview');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
        className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-3 text-xs font-bold text-white shadow-xl hover:bg-gray-800 active:scale-95 transition-transform"
        aria-label="Ver preview del soporte"
      >
        <Eye className="h-4 w-4" />
        <span>Ver preview</span>
      </button>
    </div>
  </div></DashboardShell>;
}
