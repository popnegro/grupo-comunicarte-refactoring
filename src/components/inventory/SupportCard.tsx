import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckSquare2,
  Ellipsis,
  Eye,
  Heart,
  MapPin,
  Monitor,
  Pencil,
  Play,
  Plus,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InventoryItem, MobileRoute, getDisponibilidad, isMobileRoute } from '../../types';
import { useSelection } from '../../context/SelectionContext';

interface SupportCardProps {
  item: InventoryItem;
  variant?: 'showcase' | 'catalog' | 'selectable' | 'dashboard';
  selectable?: boolean;
  onRemove?: (item: InventoryItem) => void;
  onSelectOnMap?: (item: InventoryItem) => void;
}

function formatImpacts(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(String(value).replace(/\./g, '').replace(',', '.'));
  if (!Number.isFinite(numeric)) return String(value);
  if (numeric >= 1_000_000) return `+${(numeric / 1_000_000).toFixed(1).replace('.', ',')} M`;
  if (numeric >= 1_000) return `+${Math.round(numeric / 1_000)} K`;
  return `+${Math.round(numeric).toLocaleString('es-AR')}`;
}

function getMetrics(item: InventoryItem) {
  const technical = item.technical;
  return {
    impacts: formatImpacts(technical?.monthly_impacts),
    measures: technical?.measures || null,
    resolution: technical?.resolution || null,
    caras: technical?.caras ? `${technical.caras} caras` : null,
  };
}

function getRouteAttributes(item: InventoryItem): string[] {
  if (!isMobileRoute(item)) return [];
  const route = item as MobileRoute;
  const technical = item.technical;
  const attributes: string[] = [];
  if (technical?.spot_duration_seconds) attributes.push(`${technical.spot_duration_seconds}s por spot`);
  else if (route.duration) attributes.push(route.duration);
  if (technical?.route_duration_hours) attributes.push(`${technical.route_duration_hours}h de recorrido`);
  else if (route.schedule) attributes.push(route.schedule);
  return attributes.filter(Boolean).slice(0, 2);
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

function isVideoCover(item: InventoryItem) {
  return item.technical?.metadata?.cover_media_type === 'video';
}

function mediaSlides(item: InventoryItem) {
  const media = (item.media || []).filter((entry) => entry.active !== false && entry.url).slice(0, 3);
  if (media.length) return media.map((entry) => ({ url: entry.url, kind: entry.media_type }));
  return (item.imageUrls || []).filter(Boolean).slice(0, 3).map((url, index) => ({
    url,
    kind: index === 0 && isVideoCover(item) ? 'video' as const : 'image' as const,
  }));
}

function statusClasses(status: ReturnType<typeof getDisponibilidad>) {
  if (status === 'reservado') return 'bg-amber-50 text-amber-800';
  if (status === 'inactivo') return 'bg-slate-100 text-slate-600';
  return 'bg-emerald-50 text-emerald-700';
}

function statusDot(status: ReturnType<typeof getDisponibilidad>) {
  if (status === 'reservado') return 'bg-amber-400';
  if (status === 'inactivo') return 'bg-slate-500';
  return 'bg-emerald-500';
}

function StatusBadge({
  status,
  period,
  dark = false,
}: {
  status: ReturnType<typeof getDisponibilidad>;
  period?: string;
  dark?: boolean;
}) {
  const label = status === 'reservado' ? 'Reservado' : status === 'inactivo' ? 'Inactivo' : 'Disponible';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ${
      dark ? 'bg-slate-500/90 text-white' : statusClasses(status)
    }`}>
      <span className={`h-2 w-2 rounded-full ${dark ? 'bg-slate-200' : statusDot(status)}`} />
      {label}{status === 'reservado' && period ? ` · ${period}` : ''}
    </span>
  );
}

function TypeBadge({ item, compact = false }: { item: InventoryItem; compact?: boolean }) {
  const label = item.tipo_soporte === 'led_movil' ? 'LED Móvil' : item.tipo_soporte === 'led' ? 'LED' : 'Tradicional';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg bg-slate-100 text-slate-800 ${
      compact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-[11px]'
    } font-bold`}>
      <Monitor className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {label}
    </span>
  );
}

function MetricIcon({ kind }: { kind: string }) {
  if (kind === 'impact') return <span className="text-[21px] leading-none text-emerald-500">↗</span>;
  return <Monitor className="h-4 w-4" />;
}

export function SupportCard({
  item,
  variant = 'catalog',
  selectable = false,
  onRemove,
  onSelectOnMap,
}: SupportCardProps) {
  const navigate = useNavigate();
  const { isSelected, toggleSelect } = useSelection();
  const availability = getDisponibilidad(item);
  const isReserved = availability === 'reservado';
  const isAvailable = availability === 'disponible';
  const selected = isSelected(item.canonical_id);
  const slides = mediaSlides(item);
  const [slide, setSlide] = useState(0);
  const safeIndex = slides.length ? Math.min(slide, slides.length - 1) : 0;
  const active = slides[safeIndex];
  const metrics = getMetrics(item);
  const routeAttributes = getRouteAttributes(item);
  const period = reservationPeriod(item);
  const address = 'address' in item ? item.address : item.ciudad;
  const locationLabel = `${address || item.ciudad} · ${item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}`;
  const altDescription = `Soporte publicitario ${item.name} en ${item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}`;

  if (availability === 'inactivo' && variant !== 'dashboard') return null;

  const navigateToMap = () => {
    if (onSelectOnMap) onSelectOnMap(item);
    else navigate(`/inventario?plaza=${item.ciudad}&tipo=${item.tipo_soporte}&soporte=${item.canonical_id}`);
  };

  const navigateToDetail = () => {
    navigate(`/inventario?plaza=${item.ciudad}&tipo=${item.tipo_soporte}&soporte=${item.canonical_id}`);
  };

  const renderMedia = () => {
    if (active) {
      if (active.kind === 'video') {
        return (
          <div className="relative h-full w-full">
            <video src={active.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white">
                <Play className="h-4 w-4 fill-current" />
              </span>
            </div>
          </div>
        );
      }
      return <img src={active.url} alt={altDescription} className="h-full w-full object-cover" loading="lazy" />;
    }
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <MapPin className="h-8 w-8 text-slate-300" />
      </div>
    );
  };

  const mediaControls = slides.length > 1 && (
    <>
      <button type="button" aria-label="Anterior recurso multimedia" onClick={() => setSlide((safeIndex - 1 + slides.length) % slides.length)} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white transition hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white">
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Siguiente recurso multimedia" onClick={() => setSlide((safeIndex + 1) % slides.length)} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white transition hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white">
        <ArrowRight className="h-4 w-4" />
      </button>
      <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5" role="tablist" aria-label="Miniaturas">
        {slides.map((_, index) => (
          <button key={index} type="button" aria-label={`Ir al recurso ${index + 1}`} onClick={() => setSlide(index)} className={`h-1.5 rounded-full transition-all ${index === safeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`} />
        ))}
      </div>
    </>
  );

  const renderMetricRow = (compact = false) => {
    const values = [
      metrics.impacts ? { icon: 'impact', value: metrics.impacts, label: 'impactos mensuales' } : null,
      metrics.measures ? { icon: 'measure', value: metrics.measures, label: 'dimensiones' } : null,
      metrics.resolution ? { icon: 'resolution', value: metrics.resolution, label: 'resolución' } : null,
      metrics.caras ? { icon: 'caras', value: metrics.caras, label: 'orientación' } : null,
    ].filter(Boolean) as { icon: string; value: string; label: string }[];

    if (!values.length && routeAttributes.length) {
      return <div className="flex flex-wrap gap-2">{routeAttributes.map((attribute) => <span key={attribute} className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">{attribute}</span>)}</div>;
    }

    return (
      <div className={`grid ${values.length >= 3 ? 'grid-cols-3' : values.length === 2 ? 'grid-cols-2' : 'grid-cols-1'} divide-x divide-slate-200`}>
        {values.slice(0, 3).map((metric) => (
          <div key={`${metric.label}-${metric.value}`} className={`flex min-w-0 items-center gap-2 ${compact ? 'px-2' : 'px-3'} first:pl-0 last:pr-0`}>
            <span className={`shrink-0 ${metric.icon === 'impact' ? 'text-emerald-500' : 'text-slate-500'}`}><MetricIcon kind={metric.icon} /></span>
            <span className="min-w-0">
              <span className={`block font-bold leading-tight ${metric.icon === 'impact' ? 'text-xl text-emerald-600' : 'text-sm text-slate-800'}`}>{metric.value}</span>
              <span className="block truncate text-[10px] leading-tight text-slate-500">{metric.label}</span>
            </span>
          </div>
        ))}
      </div>
    );
  };

  const cardBase = 'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm';

  if (variant === 'selectable') {
    return (
      <article className={`${cardBase} ${selected ? 'ring-2 ring-emerald-400' : ''}`}>
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          {renderMedia()}
          <div className="absolute left-3 top-3"><StatusBadge status={availability} period={period} /></div>
          <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-slate-700 shadow-sm">
            {selected ? <CheckSquare2 className="h-5 w-5 text-emerald-600" /> : <span className="h-5 w-5 rounded-md border-2 border-slate-500 bg-white" />}
          </div>
          {mediaControls}
        </div>
        <div className="p-4 sm:p-5">
          <TypeBadge item={item} compact />
          <h3 className="mt-2 text-[15px] font-bold leading-tight text-slate-950">{item.name}</h3>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{locationLabel}</p>
          <div className="mt-5">{renderMetricRow(true)}</div>
          {isReserved && item.availableFrom && <p className="mt-4 text-xs font-medium text-slate-600">Disponible desde <span className="text-slate-950">{item.availableFrom}</span></p>}
          <div className="mt-5 flex gap-3">
            {selectable && isAvailable ? (
              <button type="button" onClick={() => toggleSelect(item)} aria-pressed={selected} className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition ${selected ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'}`}>
                {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{selected ? 'Seleccionado' : 'Agregar a selección'}
              </button>
            ) : (
              <button type="button" onClick={() => navigate(`/contacto?soporte=${item.canonical_id}`)} className="flex min-h-10 flex-1 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-900">Consultar disponibilidad</button>
            )}
            <button type="button" onClick={navigateToDetail} className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800 hover:bg-slate-50">
              Ver soporte <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {onRemove && <button type="button" onClick={() => onRemove(item)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"><Trash2 className="h-4 w-4" /> Quitar</button>}
        </div>
      </article>
    );
  }

  if (variant === 'showcase') {
    return (
      <article className={`${cardBase} rounded-3xl`}>
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          {renderMedia()}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10" />
          <div className="absolute left-3 top-3"><StatusBadge status={availability} period={period} /></div>
          <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm"><Heart className="h-4 w-4" /></div>
          {mediaControls}
        </div>
        <div className="p-5 sm:p-6">
          <TypeBadge item={item} />
          <h3 className="mt-3 text-xl font-bold leading-tight text-slate-950 sm:text-2xl">{item.name}</h3>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="h-4 w-4" />{locationLabel}</p>
          <div className="mt-5">{renderMetricRow()}</div>
          {isReserved && item.availableFrom && <p className="mt-4 text-xs font-medium text-slate-600">Disponible desde <span className="text-slate-950">{item.availableFrom}</span></p>}
          <button type="button" onClick={navigateToMap} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800">Ver soporte en mapa <ArrowRight className="h-4 w-4" /></button>
        </div>
      </article>
    );
  }

  if (variant === 'dashboard') {
    const reviewStatus = item.active === false ? 'En revisión' : availability === 'reservado' ? 'Reservado' : availability === 'inactivo' ? 'Inactivo' : 'Disponible';
    return (
      <article className={`${cardBase} rounded-2xl`}>
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          {renderMedia()}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />
          <div className="absolute left-3 top-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ${reviewStatus === 'Disponible' ? 'bg-emerald-50/95 text-emerald-700' : reviewStatus === 'Reservado' ? 'bg-amber-50/95 text-amber-800' : 'bg-slate-500/90 text-white'}`}>
              <span className={`h-2 w-2 rounded-full ${reviewStatus === 'Disponible' ? 'bg-emerald-500' : reviewStatus === 'Reservado' ? 'bg-amber-400' : 'bg-slate-200'}`} />
              {reviewStatus}
            </span>
          </div>
          <button type="button" aria-label="Más acciones" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-slate-700 shadow-sm">
            <Ellipsis className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold leading-tight text-slate-950">{item.name}</h3>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{locationLabel}</p>
            </div>
            <TypeBadge item={item} compact />
          </div>
          <div className="mt-5">{renderMetricRow(true)}</div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => navigate(`/dashboard/soportes/${encodeURIComponent(item.canonical_id)}/edit`)} className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
              <Pencil className="h-3.5 w-3.5" /> Editar
            </button>
            <button type="button" onClick={() => navigate(`/dashboard/soportes/${encodeURIComponent(item.canonical_id)}/preview`)} className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
              <Eye className="h-3.5 w-3.5" /> Ver preview
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`${cardBase} rounded-2xl`}>
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        {renderMedia()}
        <div className="absolute left-3 top-3"><StatusBadge status={availability} period={period} /></div>
        <button type="button" aria-label="Agregar a favoritos" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm"><Heart className="h-4 w-4" /></button>
        {mediaControls}
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <TypeBadge item={item} compact />
          <button type="button" onClick={navigateToMap} className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50 sm:inline-flex">
            <MapPin className="h-3 w-3" /> Ver en mapa
          </button>
        </div>
        <h3 className="mt-2 text-[15px] font-bold leading-tight text-slate-950">{item.name}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{locationLabel}</p>
        <div className="mt-5">{renderMetricRow(true)}</div>
        {isReserved && item.availableFrom && <p className="mt-4 text-xs font-medium text-slate-600">Disponible desde <span className="text-slate-950">{item.availableFrom}</span></p>}
        <div className="mt-5 flex gap-3">
          {selectable && isAvailable ? (
            <button type="button" onClick={() => toggleSelect(item)} aria-pressed={selected} className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition ${selected ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'}`}>
              {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{selected ? 'Seleccionado' : 'Agregar a selección'}
            </button>
          ) : (
            <button type="button" onClick={navigateToDetail} className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800 hover:bg-slate-50">Ver detalle <ArrowRight className="h-4 w-4" /></button>
          )}
          <button type="button" onClick={navigateToDetail} className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-bold text-white hover:bg-slate-800">
            {selectable ? 'Ver detalle' : 'Ver soporte'} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {onRemove && <button type="button" onClick={() => onRemove(item)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"><Trash2 className="h-4 w-4" /> Quitar</button>}
      </div>
    </article>
  );
}
