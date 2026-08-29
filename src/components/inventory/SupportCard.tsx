import { useState } from 'react';
import { ArrowLeft, ArrowRight, MapPin, Play, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { InventoryItem, MobileRoute, getDisponibilidad, isMobileRoute } from '../../types';

interface SupportCardProps {
  item: InventoryItem;
  variant?: 'showcase' | 'catalog' | 'selectable';
  onRemove?: (item: InventoryItem) => void;
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
    return [technical?.summary, technical?.measures, technical?.caras ? `${technical.caras} caras` : '', technical?.impresion]
      .filter(Boolean).slice(0, 4) as string[];
  }

  if (item.tipo_soporte === 'led') {
    return [technical?.summary, technical?.measures, technical?.resolution, technical?.daily_frequency]
      .filter(Boolean).slice(0, 4) as string[];
  }

  return [technical?.measures, technical?.resolution, technical?.spot_duration_seconds ? `${technical.spot_duration_seconds}s por spot` : '', technical?.minimum_daily_outings ? `${technical.minimum_daily_outings} salidas` : '']
    .filter(Boolean).slice(0, 4) as string[];
}

function isVideoCover(item: InventoryItem) {
  return item.technical?.metadata?.cover_media_type === 'video';
}

function mediaSlides(item: InventoryItem) {
  const media = (item.media || []).filter((entry) => entry.active !== false && entry.url).slice(0, 3);
  if (media.length) return media.map((entry) => ({ url: entry.url, kind: entry.media_type }));
  return (item.imageUrls || []).filter(Boolean).slice(0, 3).map((url, index) => ({ url, kind: index === 0 && isVideoCover(item) ? 'video' as const : 'image' as const }));
}

export function SupportCard({ item, variant = 'catalog', onRemove }: SupportCardProps) {
  const navigate = useNavigate();
  const availability = getDisponibilidad(item);
  const reserved = availability === 'reservado';
  const slides = mediaSlides(item);
  const [slide, setSlide] = useState(0);
  const safeIndex = slides.length ? Math.min(slide, slides.length - 1) : 0;
  const active = slides[safeIndex];
  const attributes = cardAttributes(item);
  const period = reservationPeriod(item);
  const statusLabel = reserved ? `Reservado${period ? ` ${period}` : ''}` : 'Disponible';

  const renderMedia = () => {
    if (!active) return <div className="flex h-full w-full items-center justify-center bg-gray-50"><MapPin className="h-8 w-8 text-gray-300" /></div>;
    if (active.kind === 'video') return <div className="relative h-full w-full"><video src={active.url} muted playsInline preload="metadata" className="h-full w-full object-cover" /><div className="pointer-events-none absolute inset-0 flex items-center justify-center"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white"><Play className="h-4 w-4 fill-current" /></span></div></div>;
    return <img src={active.url} alt={item.name} className="h-full w-full object-cover" />;
  };

  const mediaControls = slides.length > 1 && <><button type="button" aria-label="Anterior" onClick={() => setSlide((safeIndex - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white"><ArrowLeft className="h-4 w-4" /></button><button type="button" aria-label="Siguiente" onClick={() => setSlide((safeIndex + 1) % slides.length)} className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white"><ArrowRight className="h-4 w-4" /></button><div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">{slides.map((_, index) => <button key={index} type="button" aria-label={`Ir al recurso ${index + 1}`} onClick={() => setSlide(index)} className={`h-1.5 rounded-full transition-all ${index === safeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`} />)}</div></>;

  if (availability === 'inactivo') return null;
  if (variant === 'selectable') return <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white"><div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">{renderMedia()}{mediaControls}</div><div className="p-6"><p className="text-xs font-semibold uppercase tracking-wider text-gray-600">{item.tipo_soporte.replace('_', ' ')}</p><h2 className="mt-2 text-xl font-semibold">{item.name}</h2><p className="mt-2 text-sm text-gray-600">{'address' in item ? item.address : item.ciudad}</p>{onRemove && <button type="button" onClick={() => onRemove(item)} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-950"><Trash2 className="h-4 w-4" /> Quitar</button>}</div></article>;

  return <article className={`group flex flex-col overflow-hidden border border-gray-200 bg-white ${variant === 'showcase' ? 'rounded-3xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl' : 'rounded-2xl'}`}><div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">{renderMedia()}{variant === 'showcase' && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />}{mediaControls}</div><div className="flex flex-grow flex-col p-6"><div className="mb-4 flex flex-wrap items-center gap-2"><Badge variant={item.tipo_soporte === 'tradicional' ? 'neutral' : item.tipo_soporte === 'led' ? 'red' : 'dark'} className="uppercase text-[10px]">{item.tipo_soporte.replace('_', ' ')}</Badge><Badge variant={reserved ? 'outline' : 'green'} className="uppercase text-[10px]">{statusLabel}</Badge></div><h3 className="mb-2 text-xl font-bold">{item.name}</h3><p className="text-sm leading-relaxed text-gray-600">{'address' in item ? item.address : item.ciudad}</p>{attributes.length > 0 && <div className="mt-4 flex flex-wrap gap-2" aria-label="Atributos principales">{attributes.map((attribute) => <span key={attribute} className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-800">{attribute}</span>)}</div>}<Button type="button" onClick={() => navigate(`/inventario?plaza=${item.ciudad}&tipo=${item.tipo_soporte}&soporte=${item.canonical_id}`)} variant="outline" className="mt-6 min-h-11 w-full rounded-xl">{reserved ? 'Consultar disponibilidad' : 'Ver soporte'} <ArrowRight className="h-4 w-4" /></Button></div></article>;
}
