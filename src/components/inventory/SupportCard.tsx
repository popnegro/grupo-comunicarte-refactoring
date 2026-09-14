import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, MapPin, Play, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { InventoryItem, MobileRoute, getDisponibilidad, isMobileRoute } from '../../types';
import { useSelection } from '../../context/SelectionContext';

interface SupportCardProps {
  item: InventoryItem;
  variant?: 'showcase' | 'catalog' | 'selectable';
  selectable?: boolean;
  onRemove?: (item: InventoryItem) => void;
  onSelectOnMap?: (item: InventoryItem) => void;
}

function getCardAttributes(item: InventoryItem): string[] {
  const technical = item.technical;
  const attributes: string[] = [];
  if (isMobileRoute(item)) {
    const route = item as MobileRoute;
    if (technical?.spot_duration_seconds) attributes.push(`${technical.spot_duration_seconds}s por spot`);
    else if (route.duration) attributes.push(route.duration);
    if (technical?.route_duration_hours) attributes.push(`${technical.route_duration_hours}h de recorrido`);
    else if (route.schedule) attributes.push(route.schedule);
    return attributes.filter(Boolean).slice(0, 2);
  }
  if (technical?.measures) attributes.push(technical.measures);
  if (item.tipo_soporte === 'led') {
    if (technical?.resolution) attributes.push(technical.resolution);
    if (technical?.daily_frequency && attributes.length < 2) attributes.push(technical.daily_frequency);
  } else if (item.tipo_soporte === 'tradicional') {
    if (technical?.summary) attributes.push(technical.summary);
    else if (item.family) attributes.push(item.family.replace('_', ' '));
  }
  if (attributes.length < 2 && item.characteristics) {
    const fallback = item.characteristics.split(/[•\n,;]+/).map((value) => value.trim()).filter(Boolean);
    attributes.push(...fallback);
  }
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
  return (item.imageUrls || []).filter(Boolean).slice(0, 3).map((url, index) => ({ url, kind: index === 0 && isVideoCover(item) ? 'video' as const : 'image' as const }));
}

export function SupportCard({ item, variant = 'catalog', selectable = false, onRemove, onSelectOnMap }: SupportCardProps) {
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
  const image = item.imageUrls?.[0];
  const address = 'address' in item ? item.address : item.ciudad;
  const typeLabel = item.tipo_soporte.replace('_', ' ');
  const cardAttributes = getCardAttributes(item);
  const period = reservationPeriod(item);
  const statusLabel = isReserved ? `Reservado${period ? ` (${period})` : ''}` : 'Disponible';
  const altDescription = `Soporte publicitario ${item.name} en ${item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}`;

  if (availability === 'inactivo') return null;

  const navigateToMap = () => {
    if (onSelectOnMap) onSelectOnMap(item);
    else navigate(`/inventario?plaza=${item.ciudad}&tipo=${item.tipo_soporte}&soporte=${item.canonical_id}`);
  };

  const renderMedia = () => {
    if (active) {
      if (active.kind === 'video') return <div className="relative h-full w-full"><video src={active.url} muted playsInline preload="metadata" className="h-full w-full object-cover" /><div className="pointer-events-none absolute inset-0 flex items-center justify-center"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white"><Play className="h-4 w-4 fill-current" /></span></div></div>;
      return <img src={active.url} alt={altDescription} className="h-full w-full object-cover" loading="lazy" />;
    }
    return image ? <img src={image} alt={altDescription} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full w-full items-center justify-center bg-gray-50"><MapPin className="h-8 w-8 text-gray-300" /></div>;
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

  if (variant === 'selectable') {
    return (
      <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">{renderMedia()}{mediaControls}</div>
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">{typeLabel}</p>
          <h2 className="mt-2 text-xl font-semibold">{item.name}</h2>
          <p className="mt-2 text-sm text-gray-600">{address}</p>
          {onRemove && <button type="button" onClick={() => onRemove(item)} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-950"><Trash2 className="h-4 w-4" /> Quitar</button>}
        </div>
      </article>
    );
  }

  return (
    <article className={`group bg-white border border-gray-200 overflow-hidden flex flex-col ${variant === 'showcase' ? 'rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : 'rounded-2xl'}`}>
      <div className="w-full aspect-[16/9] bg-gray-100 overflow-hidden relative">
        {renderMedia()}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
        {mediaControls}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant={item.tipo_soporte === 'tradicional' ? 'neutral' : item.tipo_soporte === 'led' ? 'red' : 'dark'} className="uppercase text-[10px]">{typeLabel}</Badge>
          <Badge variant={isReserved ? 'outline' : 'green'} className="uppercase text-[10px]">{isReserved ? 'Reservado' : 'Disponible'}</Badge>
        </div>
        <h3 className="text-xl font-bold mb-2">{item.name}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{address || item.description}</p>
        {cardAttributes.length > 0 && <div className="mt-4 flex flex-wrap gap-2" aria-label="Atributos principales">{cardAttributes.map((attribute) => <span key={attribute} className="rounded-lg bg-gray-50 border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-800">{attribute}</span>)}</div>}
        {isReserved && item.availableFrom && <p className="mt-4 text-xs text-gray-600 font-medium">Disponible desde <span className="text-gray-950">{item.availableFrom}</span></p>}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
          {selectable ? (
            isAvailable ? (
              <button type="button" onClick={() => toggleSelect(item)} aria-pressed={selected} className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${selected ? 'bg-black text-white' : 'border border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'}`}>
                {selected ? <Check className="h-4 w-4 text-emerald-400" /> : <Plus className="h-4 w-4 text-gray-500" />}<span>{selected ? 'Soporte seleccionado' : 'Añadir al Media Kit'}</span>
              </button>
            ) : (
              <button type="button" onClick={() => navigate(`/contacto?soporte=${item.canonical_id}`)} className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-100">Consultar disponibilidad</button>
            )
          ) : (
            <Button type="button" onClick={navigateToMap} variant="outline" className="w-full rounded-xl min-h-11">{isReserved ? 'Consultar disponibilidad' : 'Ver soporte'} <ArrowRight className="w-4 h-4" /></Button>
          )}
          {selectable && <button type="button" onClick={navigateToMap} className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950" title="Ver ubicación en el mapa" aria-label={`Ver ${item.name} en el mapa`}><MapPin className="h-4 w-4 text-gray-400" /><span>Mapa</span></button>}
        </div>
      </div>
    </article>
  );
}
