import { AnimatePresence, motion } from 'motion/react';
import { LocationRecord, MobileRoute, InventoryItem, isMobileRoute, getDisponibilidad } from '../../types';
import { MapPin, MonitorPlay, PanelTop, Navigation, Check, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MediaCarousel } from './MediaCarousel';
import { DetailTabs } from './DetailTabs';
import { ContactSlide } from './ContactSlide';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useSelection } from '../../context/SelectionContext';
import { useState } from 'react';

interface LocationDetailProps { item: InventoryItem; onOpenMediakit: () => void; }

export function LocationDetail({ item }: LocationDetailProps) {
  const [view, setView] = useState<'detail' | 'contact'>('detail');
  const { isSelected, toggleSelect } = useSelection();
  const isRoute = isMobileRoute(item);
  const hasImages = item.imageUrls && item.imageUrls.length > 0;
  const disponibilidad = getDisponibilidad(item);
  const isAvailable = disponibilidad === 'disponible';
  const isReserved = disponibilidad === 'reservado';
  const selected = isSelected(item.canonical_id);

  // Inactives are filtered from the public inventory by useInventory.
  // If one is passed directly, avoid presenting it as an actionable commercial product.
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
                <div className="flex flex-wrap items-center gap-2"><Badge variant="neutral" className="uppercase tracking-wider">{item.ciudad.replace('-', ' ')}</Badge><Badge variant={item.tipo_soporte === 'tradicional' ? 'neutral' : item.tipo_soporte === 'led' ? 'red' : 'dark'} className="uppercase tracking-wider">{item.tipo_soporte.replace('_', ' ')}</Badge><Badge variant={isReserved ? 'outline' : 'green'} className="uppercase tracking-wider">{isReserved ? 'Reservado' : 'Disponible'}</Badge></div>
                {isReserved && <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 leading-relaxed"><p className="font-semibold text-gray-900 mb-0.5">Soporte actualmente ocupado</p><p>Puedes consultar la fecha de liberación o alternativas en la misma zona.</p></div>}
                {isReserved && item.availableFrom && <p className="mt-2 text-xs text-gray-500 font-medium">Fecha estimada de liberación: <span className="text-gray-900 font-semibold">{item.availableFrom}</span></p>}
              </div>
            </div>
            <DetailTabs tabs={tabs} />
            {isAvailable && <button type="button" onClick={() => toggleSelect(item)} aria-pressed={selected} className={cn("mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors", selected ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-black")}>{selected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{selected ? 'Soporte seleccionado' : 'Seleccionar soporte'}</button>}
          </motion.div>
        )}
      </AnimatePresence>
      {isReserved && view === 'detail' && <div className="mt-6 pt-6 border-t border-gray-100"><Button className="w-full" onClick={() => setView('contact')}>Consultar disponibilidad</Button></div>}
    </div>
  );
}
