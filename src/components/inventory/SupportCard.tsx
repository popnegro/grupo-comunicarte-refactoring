import { ArrowRight, MapPin, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { InventoryItem, getDisponibilidad } from '../../types';

interface SupportCardProps {
  item: InventoryItem;
  variant?: 'showcase' | 'catalog' | 'selectable';
  onRemove?: (item: InventoryItem) => void;
}

export function SupportCard({ item, variant = 'catalog', onRemove }: SupportCardProps) {
  const navigate = useNavigate();
  const isReserved = getDisponibilidad(item) === 'reservado';
  const image = item.imageUrls?.[0];
  const address = 'address' in item ? item.address : item.ciudad;
  const typeLabel = item.tipo_soporte.replace('_', ' ');

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
      {image ? <div className="w-full aspect-[16/10] bg-gray-100 overflow-hidden relative"><img src={image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /><div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" /></div> : <div className="w-full aspect-[16/10] bg-gray-50 flex items-center justify-center border-b border-gray-100"><MapPin className="w-8 h-8 text-gray-300" /></div>}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant={item.tipo_soporte === 'tradicional' ? 'neutral' : item.tipo_soporte === 'led' ? 'red' : 'dark'} className="uppercase text-[10px]">{typeLabel}</Badge>
          <Badge variant={isReserved ? 'outline' : 'green'} className="uppercase text-[10px]">{isReserved ? 'Reservado' : 'Disponible'}</Badge>
          {item.isFeatured && <Badge variant="dark" className="uppercase text-[10px]">Destacado</Badge>}
        </div>
        <h3 className="text-xl font-bold mb-2 line-clamp-2">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">{address || item.description}</p>
        {isReserved && item.availableFrom && <p className="mt-auto mb-4 text-xs text-gray-600 font-medium">Disponible desde <span className="text-gray-950">{item.availableFrom}</span></p>}
        <Button type="button" onClick={() => navigate(`/inventario?plaza=${item.ciudad}&tipo=${item.tipo_soporte}&soporte=${item.canonical_id}`)} variant="outline" className="w-full rounded-xl min-h-11 mt-auto">
          {isReserved ? 'Consultar disponibilidad' : 'Ver detalle'} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </article>
  );
}
