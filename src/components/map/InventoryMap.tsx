import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, CircleMarker, Tooltip, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import { LocationRecord, MobileRoute, InventoryItem, Plaza, getDisponibilidad } from '../../types';
import { LocationDetail } from './LocationDetail';
import { X, SearchX } from 'lucide-react';
import { getIcon } from '../../lib/map-icons';
import { useSelection } from '../../context/SelectionContext';

interface InventoryMapProps {
  locations: LocationRecord[];
  routes: MobileRoute[];
  onOpenMediakit: () => void;
  initialSelectedId?: string | null;
  selectedPlaza?: Plaza | 'todos';
  onResetFilters?: () => void;
}

function MapUpdater({ locations, routes }: { locations: LocationRecord[], routes: MobileRoute[] }) {
  const map = useMap();
  useEffect(() => {
    const validLocations = locations.filter(loc => loc.lat !== null && loc.lng !== null);
    if (validLocations.length === 0 && routes.length === 0) return;
    const bounds = L.latLngBounds([]);
    validLocations.forEach(loc => { if (loc.lat && loc.lng) bounds.extend([loc.lat, loc.lng]); });
    routes.forEach(route => { if (route.routePath?.length) route.routePath.forEach(point => bounds.extend(point as [number, number])); });
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [locations, routes, map]);
  return null;
}

export default function InventoryMap({ locations, routes, onOpenMediakit, initialSelectedId, selectedPlaza, onResetFilters }: InventoryMapProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  useEffect(() => {
    if (initialSelectedId && !selectedItem) {
      const found = [...locations, ...routes].find(item => item.canonical_id === initialSelectedId);
      if (found) setSelectedItem(found);
    }
  }, [initialSelectedId, locations, routes]);
  const { isSelected } = useSelection();
  const handleSelect = (item: InventoryItem) => setSelectedItem(item);
  const handleCloseDetail = () => setSelectedItem(null);
  const validLocations = locations.filter(loc => loc.lat !== null && loc.lng !== null);

  return (
    <div className="relative w-full h-full bg-gray-100 z-0">
      <MapContainer center={[-34.6037, -58.3816]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
        {validLocations.map((loc) => (
          <Marker key={loc.canonical_id} position={[loc.lat!, loc.lng!]} icon={getIcon(loc.tipo_soporte, { isActive: selectedItem?.canonical_id === loc.canonical_id, isReservado: getDisponibilidad(loc) === 'reservado', isSelected: isSelected(loc.canonical_id) })} eventHandlers={{ click: () => handleSelect(loc) }} />
        ))}
        {routes.map((route) => (
          <LayerGroup key={route.canonical_id}>
            <Polyline positions={route.routePath as [number, number][]} color="#E53935" weight={4} opacity={0.8} dashArray="10, 10" eventHandlers={{ click: () => handleSelect(route) }} />
            {route.waypoints?.map((wp, idx) => {
              if (wp.lat === null || wp.lng === null) return null;
              return <CircleMarker key={'wp-' + idx} center={[wp.lat, wp.lng]} radius={6} pathOptions={{ color: 'white', weight: 2, fillColor: '#E53935', fillOpacity: 1 }} eventHandlers={{ click: () => handleSelect(route) }}><Tooltip direction="top" offset={[0, -10]} opacity={1} className="font-semibold shadow-lg rounded-md text-sm border-0 bg-white px-2 py-1">{wp.name}</Tooltip></CircleMarker>;
            })}
          </LayerGroup>
        ))}
        <MapUpdater locations={locations} routes={routes} />
      </MapContainer>

      {selectedItem && (
        <div className="absolute bottom-0 left-0 right-0 md:bottom-auto md:top-4 md:left-auto md:right-4 md:w-[400px] bg-white rounded-t-3xl md:rounded-2xl shadow-2xl md:shadow-xl z-[1000] md:border border-gray-100 overflow-hidden flex flex-col max-h-[75vh] md:max-h-[85vh] transition-transform">
          <div className="p-4 bg-white md:bg-gray-50 flex justify-between items-center border-b border-gray-100 shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Detalle de Soporte</span>
            <button type="button" onClick={handleCloseDetail} className="p-1.5 bg-gray-50 md:bg-white rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition-colors shadow-sm" aria-label="Cerrar detalle"><X className="w-4 h-4" /></button>
          </div>
          <div className="px-0 pt-5 pb-0 md:p-6 overflow-y-auto">
            <LocationDetail item={selectedItem} onOpenMediakit={() => { setSelectedItem(null); onOpenMediakit(); }} />
          </div>
        </div>
      )}

      {validLocations.length === 0 && routes.length === 0 && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center p-4 pointer-events-none">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white/95 p-5 text-center shadow-xl backdrop-blur-md pointer-events-auto">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
              <SearchX className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-gray-900">{selectedPlaza === 'todos' || !selectedPlaza ? 'No encontramos soportes con estos criterios.' : `No encontramos soportes con estos criterios en ${selectedPlaza === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}.`}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-500">Probá limpiando los filtros para volver a explorar el inventario.</p>
            {onResetFilters && (
              <button type="button" onClick={onResetFilters} className="mt-4 min-h-11 w-full rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-800 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2">Limpiar filtros</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
