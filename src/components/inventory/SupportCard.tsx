import { ArrowRight, MapPin, Trash2 } from 'lucide-react';
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
    if (technical?.spot_duration_seconds) {
      attributes.push(`${technical.spot_duration_seconds}s por spot`);
    } else if (route.duration) {
      attributes.push(route.duration);
    }
    if (technical?.route_duration_hours) {
      attributes.push(`${technical.route_duration_hours}h de recorrido`);
    } else if (route.schedule) {
      attributes.push(route.schedule);
    }
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

export function SupportCard({ item, variant = 'catalog', onRemove }: SupportCardProps) {
  const navigate = useNavigate();
  const disponibilidad = getDisponibilidad(item);
  const isReserved = disponibilidad === 'reservado';
  const image = item.imageUrls?.[0];
  const address = 'address' in item ? item.address : item.ciudad;
  const typeLabel = item.tipo_soporte.replace('_', ' ');
  const cardAttributes = getCardAttributes(item);

  if (disponibilidad === 'inactivo') return null;

  if (variant === 'selectable') {
    return (
      <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {image ? <img src={image} alt={item.name} className="aspect-[16/9] w-full object-cover" /> : <div className="aspect-[16/9] w-full bg-gray-50 flex items-center justify-center"><MapPin className="h-8 w-8 text-gray-300" /></div>}
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
      {image ? <div className="w-full aspect-[16/9] bg-gray-100 overflow-hidden relative"><img src={image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /><div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" /></div> : <div className="w-full aspect-[16/9] bg-gray-50 flex items-center justify-center border-b border-gray-100"><MapPin className="w-8 h-8 text-gray-300" /></div>}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant={item.tipo_soporte === 'tradicional' ? 'neutral' : item.tipo_soporte === 'led' ? 'red' : 'dark'} className="uppercase text-[10px]">{typeLabel}</Badge>
          <Badge variant={isReserved ? 'outline' : 'green'} className="uppercase text-[10px]">{isReserved ? 'Reservado' : 'Disponible'}</Badge>
        </div>
        <h3 className="text-xl font-bold mb-2">{item.name}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{address || item.description}</p>
        {cardAttributes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Atributos principales">
            {cardAttributes.map((attribute) => (
              <span key={attribute} className="rounded-lg bg-gray-50 border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-800">
                {attribute}
              </span>
            ))}
          </div>
        )}
        {isReserved && item.availableFrom && <p className="mt-4 text-xs text-gray-600 font-medium">Disponible desde <span className="text-gray-950">{item.availableFrom}</span></p>}
        <Button type="button" onClick={() => navigate(`/inventario?plaza=${item.ciudad}&tipo=${item.tipo_soporte}&soporte=${item.canonical_id}`)} variant="outline" className="w-full rounded-xl min-h-11 mt-6">
          {isReserved ? 'Consultar disponibilidad' : 'Ver soporte'} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </article>
  );
}
