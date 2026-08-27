import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, CircleMarker, Tooltip, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import { LocationRecord, MobileRoute, InventoryItem, Plaza, getDisponibilidad } from '../../types';
import { LocationDetail } from './LocationDetail';
import { X } from 'lucide-react';
import { getIcon } from '../../lib/map-icons';
import { useSelection } from '../../context/SelectionContext';

interface InventoryMapProps {
  locations: LocationRecord[];
  routes: MobileRoute[];
  onOpenMediakit: () => void;
  initialSelectedId?: string | null;
  selectedPlaza?: Plaza | 'todos';
  onResetFilters?: () => void;
  onResetToPlaza?: () => void;
}

function MapUpdater({ locations, routes }: { locations: LocationRecord[], routes: MobileRoute[] }) {
  const map = useMap();

  useEffect(() => {
    const validLocations = locations.filter(loc => loc.lat !== null && loc.lng !== null);

    if (validLocations.length === 0 && routes.length === 0) return;

    const bounds = L.latLngBounds([]);

    validLocations.forEach(loc => {
      if (loc.lat && loc.lng) {
        bounds.extend([loc.lat, loc.lng]);
      }
    });

    routes.forEach(route => {
      if (route.routePath && route.routePath.length > 0) {
        route.routePath.forEach(point => bounds.extend(point as [number, number]));
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [locations, routes, map]);

  return null;
}

export default function InventoryMap({
  locations,
  routes,
  onOpenMediakit,
  initialSelectedId,
  selectedPlaza,
  onResetFilters,
  onResetToPlaza,
}: InventoryMapProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    if (initialSelectedId && !selectedItem) {
      const found = [...locations, ...routes].find(item => item.canonical_id === initialSelectedId);
      if (found) {
        setSelectedItem(found);
      }
    }
  }, [initialSelectedId, locations, routes]);
  const { isSelected } = useSelection();

  const handleSelect = (item: InventoryItem) => {
    setSelectedItem(item);
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  const validLocations = locations.filter(loc => loc.lat !== null && loc.lng !== null);

  return (
    <div className="relative w-full h-full bg-gray-100 z-0">
      <MapContainer
        center={[-34.6037, -58.3816]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {validLocations.map((loc) => (
          <Marker
            key={loc.canonical_id}
            position={[loc.lat!, loc.lng!]}
            icon={getIcon(loc.tipo_soporte, {
              isActive: selectedItem?.canonical_id === loc.canonical_id,
              isReservado: getDisponibilidad(loc) === 'reservado',
              isSelected: isSelected(loc.canonical_id),
            })}
            eventHandlers={{
              click: () => handleSelect(loc),
            }}
          />
        ))}

        {routes.map((route) => (
          <LayerGroup key={route.canonical_id}>
            <Polyline
              positions={route.routePath as [number, number][]}
              color="#E53935"
              weight={4}
              opacity={0.8}
              dashArray="10, 10"
              eventHandlers={{
                click: () => handleSelect(route),
              }}
            />
            {route.waypoints?.map((wp, idx) => {
              if (wp.lat === null || wp.lng === null) return null;
              return (
                <CircleMarker
                  key={'wp-' + idx}
                  center={[wp.lat, wp.lng]}
                  radius={6}
                  pathOptions={{
                    color: 'white',
                    weight: 2,
                    fillColor: '#E53935',
                    fillOpacity: 1,
                  }}
                  eventHandlers={{
                    click: () => handleSelect(route),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1} className="font-semibold shadow-lg rounded-md text-sm border-0 bg-white px-2 py-1">
                    {wp.name}
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </LayerGroup>
        ))}

        <MapUpdater locations={locations} routes={routes} />
      </MapContainer>

      {selectedItem && (
        <div className="absolute bottom-0 left-0 right-0 md:bottom-auto md:top-4 md:left-auto md:right-4 md:w-[400px] bg-white rounded-t-3xl md:rounded-2xl shadow-2xl md:shadow-xl z-[1000] md:border border-gray-100 overflow-hidden flex flex-col max-h-[75vh] md:max-h-[85vh] transition-transform">
          <div className="p-4 bg-white md:bg-gray-50 flex justify-between items-center border-b border-gray-100 shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Detalle de Soporte</span>
            <button
              onClick={handleCloseDetail}
              className="p-1.5 bg-gray-50 md:bg-white rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition-colors shadow-sm"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 pt-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:p-6 overflow-y-auto">
            <LocationDetail
              item={selectedItem}
              onOpenMediakit={() => {
                setSelectedItem(null);
                onOpenMediakit();
              }}
            />
          </div>
        </div>
      )}

      {validLocations.length === 0 && routes.length === 0 && (
        <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[500] w-[calc(100%-2rem)] max-w-md pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-xl border border-gray-200 text-center">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              {selectedPlaza === 'todos' || !selectedPlaza
                ? 'No encontramos soportes con los filtros seleccionados.'
                : `No encontramos soportes con los filtros seleccionados en ${selectedPlaza === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}.`}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {onResetFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="bg-black text-white hover:bg-gray-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm active:scale-95"
                >
                  Restablecer filtros
                </button>
              )}
              {selectedPlaza && selectedPlaza !== 'todos' && onResetToPlaza && (
                <button
                  type="button"
                  onClick={onResetToPlaza}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-sm active:scale-95"
                >
                  Ver todos en {selectedPlaza === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
