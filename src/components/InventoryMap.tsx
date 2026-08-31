import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Crosshair, X } from 'lucide-react';
import { InventoryItem } from '../data/inventory';
import { useInventory } from '../context/InventoryContext';
import { useIsMobile } from '../hooks/use-mobile';
import LocationDetail from './LocationDetail';
import MediakitPanel from './MediakitPanel';
import 'leaflet/dist/leaflet.css';

const DefaultIcon = L.Icon.Default.prototype as any;
delete DefaultIcon._getIconUrl;
DefaultIcon.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface InventoryMapProps { items: InventoryItem[]; isSidebarOpen?: boolean; onSidebarClose?: () => void; }
const MENDOZA_CENTER: [number, number] = [-32.8895, -68.8458];
const MENDOZA_ZOOM = 13;

const MapResizeHandler: React.FC<{ isSidebarOpen: boolean }> = ({ isSidebarOpen }) => { const map = useMap(); useEffect(() => { const timer = setTimeout(() => map.invalidateSize(), 300); return () => clearTimeout(timer); }, [isSidebarOpen, map]); return null; };
const MapController: React.FC<{ userLocation: [number, number] | null }> = ({ userLocation }) => { const map = useMap(); useEffect(() => { if (userLocation) map.flyTo(userLocation, 15, { duration: 1.5 }); }, [userLocation, map]); return null; };
const MapInteractionHandler: React.FC<{ onMapClick: () => void }> = ({ onMapClick }) => { useMapEvents({ click: onMapClick }); return null; };

const InventoryMap: React.FC<InventoryMapProps> = ({ items, isSidebarOpen = false, onSidebarClose }) => {
  const { selectedItems, toggleItem, clearSelection } = useInventory();
  const isMobile = useIsMobile();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showMediakit, setShowMediakit] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), { threshold: 0.01 });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const handleLocate = () => { if (!navigator.geolocation) return; navigator.geolocation.getCurrentPosition((position) => setUserLocation([position.coords.latitude, position.coords.longitude]), () => {}); };
  const handleMarkerClick = (item: InventoryItem) => { setSelectedItem(item); if (isMobile && onSidebarClose) onSidebarClose(); };
  const handleMapClick = () => { if (isMobile && selectedItem) setSelectedItem(null); };
  const handleToggleSelection = () => { if (!selectedItem) return; toggleItem(selectedItem); };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100">
      <MapContainer center={MENDOZA_CENTER} zoom={MENDOZA_ZOOM} scrollWheelZoom className="w-full h-full z-0" ref={mapRef}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapResizeHandler isSidebarOpen={isSidebarOpen} />
        <MapController userLocation={userLocation} />
        <MapInteractionHandler onMapClick={handleMapClick} />
        {items.map((item) => <Marker key={item.id} position={[item.lat, item.lng]} eventHandlers={{ click: () => handleMarkerClick(item) }}><Popup>{item.name}</Popup></Marker>)}
      </MapContainer>
      <div className="absolute top-4 right-4 z-[500] flex gap-2"><button type="button" onClick={handleLocate} aria-label="Centrar en mi ubicación"><Crosshair className="w-4 h-4" /></button></div>
      {selectedItem && <LocationDetail item={selectedItem} isSelected={selectedItems.some((item) => item.id === selectedItem.id)} onToggleSelection={handleToggleSelection} onClose={() => setSelectedItem(null)} />}
      {showMediakit && <MediakitPanel open={showMediakit} onOpenChange={setShowMediakit} selectedItems={selectedItems} onClearSelection={clearSelection} />}
      {selectedItems.length > 0 && !footerVisible && <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[900] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-8"><div className="pointer-events-auto mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-2xl border bg-background/95 p-3 shadow-xl backdrop-blur"><span className="text-sm font-medium">{selectedItems.length} soporte{selectedItems.length === 1 ? '' : 's'} seleccionado{selectedItems.length === 1 ? '' : 's'}</span><div className="flex items-center gap-2"><button type="button" onClick={clearSelection}>Limpiar</button><button type="button" onClick={() => setShowMediakit(true)}>Solicitar Media Kit</button></div></div></div>}
    </div>
  );
};
export default InventoryMap;
