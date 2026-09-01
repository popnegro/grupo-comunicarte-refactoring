import { AnimatePresence, motion } from 'motion/react';
import { LocationRecord, MobileRoute, InventoryItem, isMobileRoute, getDisponibilidad } from '../../types';
import { MapPin, MonitorPlay, PanelTop, Navigation, Check, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MediaCarousel } from './MediaCarousel';
import { DetailTabs } from './DetailTabs';
import { ContactSlide } from './ContactSlide';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatusBadge } from '../dashboard/ui/StatusBadge';
import { useSelection } from '../../context/SelectionContext';
import { useState } from 'react';

interface LocationDetailProps { item: InventoryItem; onOpenMediakit: () => void; }

function getKeyAttributes(item: InventoryItem): string[] {
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

export function LocationDetail({ item }: LocationDetailProps) {
  const [view, setView] = useState<'detail' | 'contact'>('detail');
  const { isSelected, toggleSelect } = useSelection();
  const isRoute = isMobileRoute(item);
  const hasImages = item.imageUrls && item.imageUrls.length > 0;
  const disponibilidad = getDisponibilidad(item);
  const isAvailable = disponibilidad === 'disponible';
  const isReserved = disponibilidad === 'reservado';
  const selected = isSelected(item.canonical_id);
  const keyAttributes = getKeyAttributes(item);

  if (disponibilidad === 'inactivo') return null;

  const tabs = [
    { id: 'info', label: 'Información', content: <p className="text-sm text-gray-600 leading-relaxed">{item.description || 'Sin información adicional.'}</p> },
    { id: 'caracteristicas', label: 'Características', content: <p className="text-sm font-medium text-gray-900">{item.characteristics || 'Sin características registradas.'}</p> },
    isRoute
      ? { id: 'recorrido', label: 'Recorrido', content: <div className="grid grid-cols-2 gap-4"><div><h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Días y Horarios</h4><p className="text-sm font-medium text-gray-900">{(item as MobileRoute).schedule}</p></div><div><h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Duración</h4><p className="text-sm font-medium text-gray-900">{(item as MobileRoute).duration}</p></div></div> }
      : { id: 'ubicacion', label: 'Ubicación', content: <p className="text-sm font-medium text-gray-900 flex items-start gap-2"><MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />{(item as LocationRecord).address || 'Ubicación a confirmar.'}</p> },
  ];

  return (
    <div className="flex flex-col px-5 pb-6 md:px-0 md:pb-0">
      <AnimatePresence mode="wait">
        {view === 'contact' ? (
          <motion.div key="contact" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
            <ContactSlide itemName={item.name} onBack={() => setView('detail')} />
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
            {hasImages && <MediaCarousel urls={item.imageUrls!} altPrefix={item.name} />}
            <div className="flex items-start gap-4 mb-6">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border", item.tipo_soporte === 'tradicional' ? "bg-gray-50 border-gray-200 text-gray-900" : item.tipo_soporte === 'led' ? "bg-red-50 border-red-100 text-red-600" : "bg-gray-900 border-gray-800 text-white")}>
                {item.tipo_soporte === 'tradicional' && <PanelTop className="w-6 h-6" />}
                {item.tipo_soporte === 'led' && <MonitorPlay className="w-6 h-6" />}
                {item.tipo_soporte === 'led_movil' && <Navigation className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-xl font-bold leading-tight mb-1">{item.name}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral" className="uppercase tracking-wider text-[10px]">
                    {item.ciudad.replace('-', ' ')}
                  </Badge>
                  <Badge variant={item.tipo_soporte === 'tradicional' ? 'neutral' : item.tipo_soporte === 'led' ? 'red' : 'dark'} className="uppercase tracking-wider text-[10px]">
                    {item.tipo_soporte.replace('_', ' ')}
                  </Badge>
                  <StatusBadge status={disponibilidad} label={isReserved ? 'Reservado' : 'Disponible'} size="sm" />
                </div>
                {keyAttributes.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap gap-1.5" aria-label="Atributos principales">
                    {keyAttributes.map((attribute) => (
                      <span key={attribute} className="rounded-lg bg-gray-50 border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-800">{attribute}</span>
                    ))}
                  </div>
                )}
                {isReserved && <div className="mt-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed"><p className="font-semibold text-amber-950 mb-0.5">Soporte actualmente ocupado</p><p>Puedes consultar la fecha de liberación o alternativas en la misma zona.</p></div>}
                {isReserved && item.availableFrom && <p className="mt-2 text-xs text-gray-500 font-medium">Fecha estimada de liberación: <span className="text-gray-900 font-semibold">{item.availableFrom}</span></p>}
              </div>
            </div>
            <DetailTabs tabs={tabs} />
            {isAvailable && (
              <button
                type="button"
                onClick={() => toggleSelect(item)}
                aria-pressed={selected}
                className={cn(
                  "mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all shadow-2xs",
                  selected
                    ? "bg-gray-950 text-white border border-gray-950 hover:bg-gray-800"
                    : "bg-white text-gray-800 border border-gray-300 hover:border-gray-950 hover:bg-gray-50"
                )}
              >
                {selected ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
                <span>{selected ? 'Soporte seleccionado' : 'Añadir al Media Kit'}</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {isReserved && view === 'detail' && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <Button className="w-full h-11 text-xs font-bold rounded-xl" onClick={() => setView('contact')}>
            Consultar disponibilidad
          </Button>
        </div>
      )}
    </div>
  );
}
