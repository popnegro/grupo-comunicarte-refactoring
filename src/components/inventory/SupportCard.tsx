import { ReactNode, useState } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, Check, Eye, Heart, MapPin, MoreHorizontal, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StatusBadge } from '../dashboard/ui/StatusBadge';
import { useSelection } from '../../context/SelectionContext';
import { InventoryItem, MobileRoute, getDisponibilidad, isMobileRoute } from '../../types';

interface SupportCardProps {
  item: InventoryItem;
  variant?: 'showcase' | 'catalog' | 'selectable' | 'dashboard';
  selectable?: boolean;
  onRemove?: (item: InventoryItem) => void;
  onSelectOnMap?: (item: InventoryItem) => void;
}

function shortDate(value?: string) {
  if (!value) return '';
  const match = String(value).match(/^(?:\d{4}-)?(\d{2})[-\/](\d{2})/);
  if (match) return `${match[2]}/${match[1]}`;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return `${String(parsed.getDate()).padStart(2, '0')}/${String(parsed.getMonth() + 1).padStart(2, '0')}`;
}

function reservationPeriod(item: InventoryItem) {
  const from = item.reservedFrom || item.technical?.metadata?.reserved_from;
  const until = item.reservedUntil || item.technical?.metadata?.reserved_until;
  if (from && until) return `desde ${shortDate(String(from))} a ${shortDate(String(until))}`;
  const legacy = item.availableFrom?.split('|');
  if (legacy?.length === 2 && legacy[0] && legacy[1]) return `desde ${shortDate(legacy[0])} a ${shortDate(legacy[1])}`;
  return '';
}

function cardAttributes(item: InventoryItem): string[] {
  const technical = item.technical;
  if (isMobileRoute(item)) {
    const route = item as MobileRoute;
    return [
      technical?.spot_duration_seconds ? `${technical.spot_duration_seconds}s por spot` : route.duration,
      technical?.minimum_daily_outings ? `${technical.minimum_daily_outings} salidas` : '',
      technical?.route_duration_hours ? `${technical.route_duration_hours}h de recorrido` : '',
      route.schedule,
    ].filter(Boolean).slice(0, 4) as string[];
  }
  if (item.tipo_soporte === 'tradicional') {
    return [technical?.summary, technical?.measures, technical?.caras ? `${technical.caras} caras` : '', technical?.impresion].filter(Boolean).slice(0, 4) as string[];
  }
  if (item.tipo_soporte === 'led') {
    return [technical?.summary, technical?.measures, technical?.resolution, technical?.daily_frequency].filter(Boolean).slice(0, 4) as string[];
  }
  return [technical?.measures, technical?.resolution, technical?.spot_duration_seconds ? `${technical.spot_duration_seconds}s por spot` : '', technical?.minimum_daily_outings ? `${technical.minimum_daily_outings} salidas` : ''].filter(Boolean).slice(0, 4) as string[];
}

function getMonthlyImpacts(item: InventoryItem): number | string | null {
  const value = item.technical?.monthly_impacts ?? item.technical?.metadata?.monthly_impacts ?? item.technical?.metadata?.monthlyImpacts ?? item.technical?.metadata?.impactos_mensuales;
  return typeof value === 'number' || typeof value === 'string' ? value : null;
}

function formatMonthlyImpacts(value: number | string | null) {
  if (value === null || value === '') return null;
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/\./g, '').replace(',', '.'));
  if (Number.isFinite(numeric)) {
    if (numeric >= 1000000) return `${(numeric / 1000000).toFixed(numeric >= 10000000 ? 0 : 1).replace('.0', '')} M`;
    if (numeric >= 1000) return `${Math.round(numeric / 1000)} K`;
    return new Intl.NumberFormat('es-AR').format(numeric);
  }
  return String(value);
}

function isVideoCover(item: InventoryItem) {
  return item.technical?.metadata?.cover_media_type === 'video';
}

function mediaSlides(item: InventoryItem) {
  const media = (item.media || []).filter((entry) => entry.active !== false && entry.url).slice(0, 3);
  if (media.length) return media.map((entry) => ({ url: entry.url, kind: entry.media_type }));
  return (item.imageUrls || []).filter(Boolean).slice(0, 3).map((url, index) => ({ url, kind: index === 0 && isVideoCover(item) ? 'video' as const : 'image' as const }));
}

function typeLabel(item: InventoryItem) {
  if (item.tipo_soporte === 'led') return 'LED';
  if (item.tipo_soporte === 'tradicional') return 'Tradicional';
  return 'LED Móvil';
}

export function SupportCard({ item, variant = 'catalog', selectable = false, onRemove, onSelectOnMap }: SupportCardProps) {
  const navigate = useNavigate();
  const { isSelected, toggleSelect } = useSelection();
  const availability = getDisponibilidad(item);
  const reserved = availability === 'reservado';
  const isAvailable = availability === 'disponible';
  const selected = isSelected(item.canonical_id);
  const slides = mediaSlides(item);
  const [slide, setSlide] = useState(0);
  const safeIndex = slides.length ? Math.min(slide, slides.length - 1) : 0;
  const active = slides[safeIndex];
  const attributes = cardAttributes(item);
  const period = reservationPeriod(item);
  const altDescription = `Soporte publicitario ${item.name} en ${item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}`;
  const monthlyImpacts = formatMonthlyImpacts(getMonthlyImpacts(item));
  const address = 'address' in item ? item.address : item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires';

  if (availability === 'inactivo') return null;

  const navigateToMap = () => {
    if (onSelectOnMap) onSelectOnMap(item);
    else navigate(`/inventario?plaza=${item.ciudad}&tipo=${item.tipo_soporte}&soporte=${item.canonical_id}`);
  };

  const renderMedia = () => {
    if (!active) return <div className="flex h-full w-full items-center justify-center bg-gray-50"><MapPin className="h-8 w-8 text-gray-300" /></div>;
    if (active.kind === 'video') return <div className="relative h-full w-full"><video src={active.url} muted playsInline preload="metadata" className="h-full w-full object-cover" /><div className="pointer-events-none absolute inset-0 flex items-center justify-center"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white"><Play className="h-4 w-4 fill-current" /></span></div></div>;
    return <img src={active.url} alt={altDescription} className="h-full w-full object-cover" loading="lazy" />;
  };

  const mediaControls = slides.length > 1 && (
    <>
      <button type="button" aria-label="Anterior recurso multimedia" onClick={() => setSlide((safeIndex - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"><ArrowLeft className="h-4 w-4" /></button>
      <button type="button" aria-label="Siguiente recurso multimedia" onClick={() => setSlide((safeIndex + 1) % slides.length)} className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"><ArrowRight className="h-4 w-4" /></button>
      <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5" role="tablist" aria-label="Miniaturas">
        {slides.map((_, index) => <button key={index} type="button" aria-label={`Ir al recurso ${index + 1}`} onClick={() => setSlide(index)} className={`h-1.5 rounded-full transition-all ${index === safeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`} />)}
      </div>
    </>
  );

  const mediaFrame = (topRight?: ReactNode) => (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
      {renderMedia()}
      <div className="absolute left-3 top-3 z-10"><StatusBadge status={availability} label={reserved ? 'Reservado' : 'Disponible'} size="sm" /></div>
      {topRight}
      {mediaControls}
    </div>
  );

  const metaBlock = (count: 2 | 3) => {
    const values = attributes.slice(0, count);
    if (!values.length) return null;
    const grid = count === 3 ? 'grid-cols-3' : 'grid-cols-2';
    return <div className={`mt-4 grid ${grid} divide-x divide-gray-100 border-t border-gray-100`}>
      {values.map((attribute) => <div key={attribute} className="min-w-0 px-3 py-3 first:pl-0 last:pr-0"><p className="truncate text-xs font-semibold text-gray-900">{attribute}</p><p className="mt-0.5 text-[10px] text-gray-400">Dato técnico</p></div>)}
    </div>;
  };

  if (variant === 'showcase') {
    return <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      {mediaFrame(<div className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-sm" aria-hidden="true"><Heart className="h-5 w-5" /></div>)}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <Badge variant="neutral" className="w-fit uppercase text-[10px] font-semibold tracking-[0.1em]">{typeLabel(item)}</Badge>
        <h3 className="mt-3 text-xl font-semibold leading-6 tracking-tight text-gray-950">{item.name}</h3>
        <p className="mt-2 flex items-start gap-1.5 text-sm leading-5 text-gray-500"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />{address}</p>
        {monthlyImpacts && <div className="mt-5 border-t border-gray-100 pt-4"><div className="flex items-center gap-2 text-gray-500"><BarChart3 className="h-4 w-4" /><span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Impactos mensuales</span></div><div className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">+{monthlyImpacts}</div></div>}
        {metaBlock(3)}
        {reserved && period && <p className="mt-3 text-xs text-gray-500">{period}</p>}
        <div className="mt-auto pt-5"><Button type="button" onClick={navigateToMap} className="h-10 w-full justify-between rounded-lg px-4 text-xs font-semibold"><span>{reserved ? 'Consultar disponibilidad' : 'Ver soporte en mapa'}</span><ArrowRight className="h-4 w-4" /></Button></div>
      </div>
    </article>;
  }

  if (variant === 'selectable') {
    return <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {mediaFrame(<div className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-white/95 shadow-sm ${selected ? 'text-emerald-600' : 'text-gray-600'}`} aria-hidden="true">{selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}</div>)}
      <div className="p-5"><Badge variant="neutral" className="w-fit uppercase text-[10px] font-semibold tracking-[0.1em]">{typeLabel(item)}</Badge><h2 className="mt-2 text-base font-semibold leading-5 text-gray-950">{item.name}</h2><p className="mt-1 flex items-center gap-1.5 text-sm leading-5 text-gray-500"><MapPin className="h-3.5 w-3.5" />{address}</p>{monthlyImpacts && <div className="mt-4 flex items-baseline gap-2"><BarChart3 className="h-4 w-4 text-emerald-500" /><span className="text-xl font-semibold tracking-tight text-gray-950">+{monthlyImpacts}</span><span className="text-xs text-gray-500">impactos mensuales</span></div>}{metaBlock(2)}<div className="mt-4 flex items-center justify-between gap-3"><button type="button" onClick={() => toggleSelect(item)} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3.5 text-xs font-semibold ${selected ? 'bg-emerald-50 text-emerald-700' : 'border border-gray-200 text-gray-700'}`} aria-pressed={selected}>{selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{selected ? 'Seleccionado' : 'Agregar a selección'}</button><button type="button" onClick={navigateToMap} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 text-xs font-semibold text-gray-700">Ver soporte <ArrowRight className="h-4 w-4" /></button></div>{onRemove && <button type="button" onClick={() => onRemove(item)} className="mt-3 inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900" aria-label={`Quitar ${item.name} de la selección`}><Trash2 className="h-3.5 w-3.5" /> Quitar</button>}</div>
    </article>;
  }

  if (variant === 'dashboard') {
    return <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {mediaFrame(<div className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-gray-700 shadow-sm" aria-hidden="true"><MoreHorizontal className="h-4 w-4" /></div>)}
      <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-base font-semibold leading-5 text-gray-950">{item.name}</h3><p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500"><MapPin className="h-3.5 w-3.5" />{address}</p></div><Badge variant="neutral" className="shrink-0 uppercase text-[10px] font-semibold tracking-[0.1em]">{typeLabel(item)}</Badge></div>{monthlyImpacts && <div className="mt-4 flex items-baseline gap-2"><BarChart3 className="h-4 w-4 text-emerald-500" /><span className="text-xl font-semibold tracking-tight text-gray-950">+{monthlyImpacts}</span><span className="text-xs text-gray-500">impactos mensuales</span></div>}{metaBlock(2)}<div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => navigate(`/dashboard/soportes/${encodeURIComponent(item.canonical_id)}/edit`)} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"><Pencil className="h-3.5 w-3.5" />Editar</button><button type="button" onClick={() => navigate(`/dashboard/soportes/${encodeURIComponent(item.canonical_id)}/preview`)} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" />Ver preview</button></div></div>
    </article>;
  }

  return <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
    {mediaFrame(selectable ? <div className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-white/95 shadow-sm ${selected ? 'text-emerald-600' : 'text-gray-700'}`} aria-hidden="true">{selected ? <Check className="h-4 w-4" /> : <Heart className="h-4 w-4" />}</div> : <div className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-gray-700 shadow-sm" aria-hidden="true"><Heart className="h-4 w-4" /></div>)}
    <div className="flex flex-1 flex-col p-5 sm:p-6"><Badge variant="neutral" className="w-fit uppercase text-[10px] font-semibold tracking-[0.1em]">{typeLabel(item)}</Badge><h3 className="mt-2 text-base font-semibold leading-5 text-gray-950">{item.name}</h3><p className="mt-1 flex items-center gap-1.5 text-sm leading-5 text-gray-500"><MapPin className="h-3.5 w-3.5" />{address}</p>{monthlyImpacts && <div className="mt-4 flex items-baseline gap-2"><BarChart3 className="h-4 w-4 text-emerald-500" /><span className="text-xl font-semibold tracking-tight text-gray-950">+{monthlyImpacts}</span><span className="text-xs text-gray-500">impactos mensuales</span></div>}{metaBlock(3)}<div className="mt-auto pt-4">{selectable ? <div className="grid grid-cols-2 gap-2">{isAvailable ? <button type="button" onClick={() => toggleSelect(item)} aria-pressed={selected} className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold ${selected ? 'bg-emerald-50 text-emerald-700' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>{selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{selected ? 'Soporte seleccionado' : 'Agregar a selección'}</button> : <button type="button" onClick={() => navigate(`/contacto?soporte=${encodeURIComponent(item.canonical_id)}`)} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-900">Consultar disponibilidad</button>}<button type="button" onClick={navigateToMap} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-gray-950 px-3 text-xs font-semibold text-white hover:bg-gray-800">Ver detalle <ArrowRight className="h-4 w-4" /></button></div> : <Button type="button" onClick={navigateToMap} variant="outline" className="min-h-10 h-10 w-full justify-between rounded-lg text-xs font-semibold hover:bg-gray-50"><span>{reserved ? 'Consultar disponibilidad' : 'Ver soporte en mapa'}</span><ArrowRight className="h-4 w-4" /></Button>}</div></div>
  </article>;
}
