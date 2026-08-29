import { useState } from 'react';
import { ArrowLeft, ArrowRight, MapPin, Trash2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { InventoryItem, MobileRoute, getDisponibilidad, isMobileRoute } from '../../types';

interface SupportCardProps {
  item: InventoryItem;
  variant?: 'showcase' | 'catalog' | 'selectable';
  onRemove?: (item: InventoryItem) => void;
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

function formatShortDate(value?: string) {
  if (!value) return '';
  const match = value.match(/^(?:\d{4}-)?(\d{2})[-\/](\d{2})/);
  if (match) return `${match[2]}/${match[1]}`;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${String(parsed.getDate()).padStart(2, '0')}/${String(parsed.getMonth() + 1).padStart(2, '0')}`;
}

function getReservationLabel(item: InventoryItem) {
  const from = item.reservedFrom || item.technical?.metadata?.reserved_from;
  const until = item.reservedUntil || item.technical?.metadata?.reserved_until;
  if (from && until) return `Reservado desde ${formatShortDate(String(from))} a ${formatShortDate(String(until))}`;
  const legacyPeriod = item.availableFrom?.split('|');
  if (legacyPeriod?.length === 2 && legacyPeriod[0] && legacyPeriod[1]) return `Reservado desde ${formatShortDate(legacyPeriod[0])} a ${formatShortDate(legacyPeriod[1])}`;
  return null;
}

function isVideoCover(item: InventoryItem) {
  return item.technical?.metadata?.cover_media_type === 'video';
}

export function SupportCard({ item, variant = 'catalog', onRemove }: SupportCardProps) {
  const navigate = useNavigate();
  const disponibilidad = getDisponibilidad(item);
  const isReserved = disponibilidad === 'reservado';
  const cardAttributes = getCardAttributes(item);
  const reservationLabel = isReserved ? getReservationLabel(item) : null;
  const media = (item.media || []).filter((entry) => entry.active !== false && entry.url).slice(0, 3);
  const imageUrls = (item.imageUrls || []).filter(Boolean).slice(0, 3);
  const slides = media.length ? media.map((entry) => ({ url: entry.url, kind: entry.media_type })) : imageUrls.map((url, index) => ({ url, kind: index === 0 && isVideoCover(item) ? 'video' : 'image' as const }));
  const [slide, setSlide] = useState(0);
  const safeIndex = slides.length ? Math.min(slide, slides.length - 1) : 0;
  const activeSlide = slides[safeIndex];

  if (disponibilidad === 'inactivo') return null;

  const renderMedia = (className = 'w-full h-full object-cover') => {
    if (!activeSlide) return <div className="w-full h-full bg-gray-50 flex items-center justify-center"><MapPin className="w-8 h-8 text-gray-300" /></div>;
    if (activeSlide.kind === 'video') return <div className="relative h-full w-full"><video src={activeSlide.url} muted playsInline preload="metadata" className={className} /><div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white"><Play className="h-4 w-4 fill-current" aria-hidden="true" /></span></div></div>;
    return <img src={activeSlide.url} alt={item.name} className={className} />;
  };

  if (variant === 'selectable') return <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white"><div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">{renderMedia()}{slides.length > 1 && <><button type="button" aria-label="Anterior" onClick={() => setSlide((safeIndex - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white"><ArrowLeft className="h-4 w-4"/></button><button type="button" aria-label="Siguiente" onClick={() => setSlide((safeIndex + 1) % slides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white"><ArrowRight className="h-4 w-4"/></button></>}</div><div className="p-6"><p className="text-xs font-semibold uppercase tracking-wider text-gray-600">{item.tipo_soporte.replace('_', ' ')}</p><h2 className="mt-2 text-xl font-semibold">{item.name}</h2><p className="mt-2 text-sm text-gray-600">{'address' in item ? item.address : item.ciudad}</p>{onRemove && <button type="button" onClick={() => onRemove(item)} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-950"><Trash2 className="h-4 w-4" /> Quitar</button>}</div></article>;

  return <article className={`group bg-white border border-gray-200 overflow-hidden flex flex-col ${variant === 'showcase' ? 'rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : 'rounded-2xl'}`}><div className="w-full aspect-[16/9] bg-gray-100 overflow-hidden relative">{renderMedia()}{variant === 'showcase' && <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />}{slides.length > 1 && <><button type="button" aria-label="Anterior" onClick={() => setSlide((safeIndex - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"><ArrowLeft className="h-4 w-4"/></button><button type="button" aria-label="Siguiente" onClick={() => setSlide((safeIndex + 1) % slides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"><ArrowRight className="h-4 w-4"/></button><div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5" aria-label={`Recurso ${safeIndex + 1} de ${slides.length}`}>{slides.map((_, index) => <button key={index} type="button" aria-label={`Ir al recurso ${index + 1}`} onClick={() => setSlide(index)} className={`h-1.5 rounded-full transition-all ${index === safeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`} />)}</div></>}</div><div className="p-6 flex flex-col flex-grow"><div className="flex items-center gap-2 mb-4 flex-wrap"><Badge variant={item.tipo_soporte === 'tradicional' ? 'neutral' : item.tipo_soporte === 'led' ? 'red' : 'dark'} className="uppercase text-[10px]">{item.tipo_soporte.replace('_', ' ')}</Badge><Badge variant={isReserved ? 'outline' : 'green'} className="uppercase text-[10px]">{isReserved ? 'Reservado' : 'Disponible'}</Badge></div><h3 className="text-xl font-bold mb-2">{item.name}</h3><p className="text-sm text-gray-600 leading-relaxed">{'address' in item ? item.address : item.description}</p>{cardAttributes.length > 0 && <div className="mt-4 flex flex-wrap gap-2" aria-label="Atributos principales">{cardAttributes.map((attribute) => <span key={attribute} className="rounded-lg bg-gray-50 border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-800">{attribute}</span>)}</div>}{reservationLabel && <p className="mt-4 text-xs font-semibold text-gray-700">{reservationLabel}</p>}<Button type="button" onClick={() => navigate(`/inventario?plaza=${item.ciudad}&tipo=${item.tipo_soporte}&soporte=${item.canonical_id}`)} variant="outline" className="w-full rounded-xl min-h-11 mt-6">{isReserved ? 'Consultar disponibilidad' : 'Ver soporte'} <ArrowRight className="w-4 h-4" /></Button></div></article>;
}
