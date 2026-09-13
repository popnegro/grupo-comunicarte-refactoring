import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, MapPin, Play, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StatusBadge } from '../dashboard/ui/StatusBadge';
import { useSelection } from '../../context/SelectionContext';
import { InventoryItem, MobileRoute, getDisponibilidad, isMobileRoute } from '../../types';

interface SupportCardProps {
  item: InventoryItem;
  variant?: 'showcase' | 'catalog' | 'selectable';
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

function isVideoCover(item: InventoryItem) {
  return item.technical?.metadata?.cover_media_type === 'video';
}

function mediaSlides(item: InventoryItem) {
  const media = (item.media || []).filter((entry) => entry.active !== false && entry.url).slice(0, 3);
  if (media.length) return media.map((entry) => ({ url: entry.url, kind: entry.media_type }));
  return (item.imageUrls || []).filter(Boolean).slice(0, 3).map((url, index) => ({ url, kind: index === 0 && isVideoCover(item) ? 'video' as const : 'image' as const }));
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
  const statusLabel = reserved ? `Reservado${period ? ` (${period})` : ''}` : 'Disponible';
  const altDescription = `Soporte publicitario ${item.name} en ${item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}`;

  const renderMedia = () => {
    if (!active) return <div className="flex h-full w-full items-center justify-center bg-gray-50"><MapPin className="h-8 w-8 text-gray-300" /></div>;
    if (active.kind === 'video') return <div className="relative h-full w-full"><video src={active.url} muted playsInline preload="metadata" className="h-full w-full object-cover" /><div className="pointer-events-none absolute inset-0 flex items-center justify-center"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white"><Play className="h-4 w-4 fill-current" /></span></div></div>;
    return <img src={active.url} alt={altDescription} className="h-full w-full object-cover" loading="lazy" />;
  };

  const mediaControls = slides.length > 1 && (
    <>
      <button type="button" aria-label="Anterior recurso multimedia" onClick={() => setSlide((safeIndex - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"><ArrowLeft className="h-4 w-4" /></button>
      <button type="button" aria-label="Siguiente recurso multimedia" onClick={() => setSlide((safeIndex + 1) % slides.length)} className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"><ArrowRight className="h-4 w-4" /></button>
      <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5" role="tablist" aria-label="Miniaturas">
        {slides.map((_, index) => <button key={index} type="button" aria-label={`Ir al recurso ${index + 1}`} onClick={() => setSlide(index)} className={`h-1.5 rounded-full transition-all ${index === safeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`} />)}
      </div>
    </>
  );

  if (availability === 'inactivo') return null;

  if (variant === 'selectable') {
    return (
      <article className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">{renderMedia()}{mediaControls}</div>
        <div className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">{item.tipo_soporte.replace('_', ' ')}</p>
          <h2 className="mt-1 text-base font-semibold leading-5 text-gray-950">{item.name}</h2>
          <p className="mt-1 text-sm leading-5 text-gray-500">{'address' in item ? item.address : item.ciudad}</p>
          {onRemove && <button type="button" onClick={() => onRemove(item)} className="mt-4 inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition" aria-label={`Quitar ${item.name} de la selección`}><Trash2 className="h-4 w-4" /> Quitar de la selección</button>}
        </div>
      </article>
    );
  }

  const navigateToMap = () => {
    if (onSelectOnMap) onSelectOnMap(item);
    else navigate(`/inventario?plaza=${item.ciudad}&tipo=${item.tipo_soporte}&soporte=${item.canonical_id}`);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors duration-200 hover:border-gray-300">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">{renderMedia()}{mediaControls}</div>
      <div className="flex flex-grow flex-col p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="neutral" className="uppercase text-[10px] font-semibold tracking-[0.1em]">{item.tipo_soporte.replace('_', ' ')}</Badge>
          <StatusBadge status={availability} label={statusLabel} size="sm" />
        </div>
        <h3 className="mb-1 text-lg font-semibold leading-6 text-gray-950">{item.name}</h3>
        <p className="text-sm leading-5 text-gray-500">{'address' in item ? item.address : item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}</p>
        {attributes.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Atributos principales">{attributes.map((attribute) => <span key={attribute} className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium leading-4 text-gray-600">{attribute}</span>)}</div>}
        <div className="mt-auto pt-5">
          {selectable ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {isAvailable ? (
                <button type="button" onClick={() => toggleSelect(item)} aria-pressed={selected} className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${selected ? 'bg-black text-white' : 'border border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'}`}>
                  {selected ? <Check className="h-4 w-4 text-emerald-400" /> : <Plus className="h-4 w-4 text-gray-500" />}<span>{selected ? 'Soporte seleccionado' : 'Añadir al Media Kit'}</span>
                </button>
              ) : (
                <button type="button" onClick={() => navigate(`/contacto?soporte=${item.canonical_id}`)} className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors">Consultar disponibilidad</button>
              )}
              <button type="button" onClick={navigateToMap} className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950 transition-colors" title="Ver ubicación en el mapa" aria-label={`Ver ${item.name} en el mapa`}><MapPin className="h-4 w-4 text-gray-400" /><span className="sm:hidden lg:inline">Mapa</span></button>
            </div>
          ) : (
            <Button type="button" onClick={navigateToMap} variant="outline" className="min-h-10 h-10 w-full justify-between rounded-lg text-xs font-semibold hover:bg-gray-50"><span>{reserved ? 'Consultar disponibilidad' : 'Ver soporte en mapa'}</span><ArrowRight className="h-4 w-4" /></Button>
          )}
        </div>
      </div>
    </article>
  );
}
