import { useState } from 'react';
import { ArrowRight, Check, CheckSquare2, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InventoryItem, getDisponibilidad } from '../../types';
import { useSelection } from '../../context/SelectionContext';
import {
  FactStrip,
  LocationLine,
  StatusBadge,
  SupportMedia,
  TypeBadge,
  mediaSlides,
  reservationPeriod,
} from './SupportCardPrimitives';

interface SupportCardProps {
  item: InventoryItem;
  variant?: 'showcase' | 'catalog' | 'selectable' | 'dashboard';
  selectable?: boolean;
  onRemove?: (item: InventoryItem) => void;
  onSelectOnMap?: (item: InventoryItem) => void;
}

const cardBase = 'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm';

export function SupportCard({ item, variant = 'catalog', selectable = false, onRemove, onSelectOnMap }: SupportCardProps) {
  const navigate = useNavigate();
  const { isSelected, toggleSelect } = useSelection();
  const status = getDisponibilidad(item);
  const selected = isSelected(item.canonical_id);
  const slides = mediaSlides(item);
  const [slide, setSlide] = useState(0);
  const index = slides.length ? Math.min(slide, slides.length - 1) : 0;
  const period = reservationPeriod(item);
  const locationUrl = `/inventario?plaza=${item.ciudad}&tipo=${item.tipo_soporte}&soporte=${encodeURIComponent(item.canonical_id)}`;
  const detailUrl = locationUrl;
  const contactUrl = `/contacto?soporte=${encodeURIComponent(item.canonical_id)}`;
  const alt = `Soporte publicitario ${item.name}`;

  if (status === 'inactivo' && variant !== 'dashboard') return null;

  const openMap = () => {
    if (onSelectOnMap) onSelectOnMap(item);
    else navigate(locationUrl);
  };

  const openDetail = () => navigate(detailUrl);

  const media = (
    <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
      <SupportMedia
        slides={slides}
        index={index}
        onPrevious={() => setSlide((index - 1 + slides.length) % slides.length)}
        onNext={() => setSlide((index + 1) % slides.length)}
        onSelect={setSlide}
        alt={alt}
      />
      <div className="absolute left-3 top-3"><StatusBadge item={item} /></div>
    </div>
  );

  const titleBlock = (
    <div className="min-w-0">
      <div className="flex items-center gap-2"><TypeBadge item={item} /></div>
      <h3 className="mt-1.5 line-clamp-2 text-[15px] font-bold leading-tight text-slate-950">{item.name}</h3>
      <div className="mt-2"><LocationLine item={item} /></div>
    </div>
  );

  if (variant === 'showcase') {
    return (
      <article className={`${cardBase} rounded-3xl`}>
        {media}
        <div className="p-5 sm:p-6">
          {titleBlock}
          <div className="mt-5"><FactStrip item={item} /></div>
          {period && status === 'reservado' && <p className="mt-3 text-xs font-medium text-slate-600">{period}</p>}
          <button type="button" onClick={openDetail} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">
            Ver soporte <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </article>
    );
  }

  if (variant === 'dashboard') {
    return (
      <article className={`${cardBase} rounded-2xl`}>
        {media}
        <div className="p-4 sm:p-5">
          {titleBlock}
          <div className="mt-5"><FactStrip item={item} /></div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => navigate(`/dashboard/soportes/${encodeURIComponent(item.canonical_id)}/edit`)} className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
              <Pencil className="h-3.5 w-3.5" /> Editar
            </button>
            <button type="button" onClick={() => navigate(`/dashboard/soportes/${encodeURIComponent(item.canonical_id)}/preview`)} className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
              <Eye className="h-3.5 w-3.5" /> Preview
            </button>
          </div>
        </div>
      </article>
    );
  }

  const canSelect = selectable && status === 'disponible';

  return (
    <article className={`${cardBase} ${selected ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}`}>
      <div className="relative">
        {media}
        {variant === 'selectable' && (
          <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 shadow-sm">
            {selected ? <CheckSquare2 className="h-5 w-5 text-emerald-600" /> : <span className="h-5 w-5 rounded-md border-2 border-slate-500" />}
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5">
        {titleBlock}
        <div className="mt-5"><FactStrip item={item} /></div>
        {period && status === 'reservado' && <p className="mt-3 text-xs font-medium text-slate-600">{period}</p>}
        <div className="mt-5 flex gap-3">
          {canSelect ? (
            <button type="button" onClick={() => toggleSelect(item)} aria-pressed={selected} className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold ${selected ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'bg-slate-950 text-white hover:bg-slate-800'}`}>
              {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{selected ? 'Seleccionado' : 'Seleccionar'}
            </button>
          ) : status === 'reservado' ? (
            <button type="button" onClick={() => navigate(contactUrl)} className="flex min-h-10 flex-1 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-900">
              Consultar disponibilidad
            </button>
          ) : null}
          <button type="button" onClick={openDetail} className={`flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold ${canSelect || status === 'reservado' ? 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50' : 'bg-slate-950 text-white'}`}>
            Ver soporte <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {onRemove && <button type="button" onClick={() => onRemove(item)} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900"><Trash2 className="h-4 w-4" /> Quitar</button>}
        <button type="button" onClick={openMap} className="mt-3 text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline">Ver ubicación en mapa</button>
      </div>
    </article>
  );
}
