import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import InventoryMap from '../components/map/InventoryMap';
import { MediakitPanel } from '../components/map/MediakitPanel';
import { StickySelectionBar } from '../components/map/StickySelectionBar';
import { SelectionToast } from '../components/map/SelectionToast';
import { useInventory } from '../hooks/useInventory';
import { Plaza, TipoSoporte, Disponibilidad, InventoryItem } from '../types';
import { MapFilterPanel } from '../components/map/MapFilterPanel';
import { SlidersHorizontal, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSelection } from '../context/SelectionContext';
import { Button } from '../components/ui/Button';

type DisponibilidadFilter = Disponibilidad | 'todos';

export default function Inventario() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: allItems, fixedLocations, mobileRoutes, loading, error, refetch } = useInventory();

  const plazaParam = searchParams.get('plaza') as Plaza | 'todos' | null;
  const tipoParam = searchParams.get('tipo') as TipoSoporte | 'todos' | null;
  const dispParam = searchParams.get('disponibilidad') as DisponibilidadFilter | null;

  const [selectedPlaza, setSelectedPlaza] = useState<Plaza | 'todos'>(plazaParam || 'todos');
  const [selectedTipo, setSelectedTipo] = useState<TipoSoporte | 'todos'>(tipoParam || 'todos');
  const [selectedDisponibilidad, setSelectedDisponibilidad] = useState<DisponibilidadFilter>(dispParam || 'todos');
  const [searchText, setSearchText] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMediakitOpen, setIsMediakitOpen] = useState(false);

  const { selectedCount, showToast, getSelectedItems } = useSelection();

  // Intercept Media Kit opening when selection is empty (H-02)
  const handleOpenMediakit = useCallback(() => {
    if (selectedCount === 0) {
      showToast('Selecciona al menos un soporte en el mapa para armar tu propuesta.', undefined, 2800);
      return;
    }
    setIsMediakitOpen(true);
    setIsMobileFiltersOpen(false);
  }, [selectedCount, showToast]);

  // Contextual Reset actions (H-01)
  const handleResetFilters = useCallback(() => {
    setSelectedPlaza('todos');
    setSelectedTipo('todos');
    setSelectedDisponibilidad('todos');
    setSearchText('');
  }, []);

  const handleResetToPlaza = useCallback(() => {
    setSelectedTipo('todos');
    setSelectedDisponibilidad('todos');
    setSearchText('');
  }, []);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedPlaza !== 'todos') params.set('plaza', selectedPlaza);
    if (selectedTipo !== 'todos') params.set('tipo', selectedTipo);
    if (selectedDisponibilidad !== 'todos') params.set('disponibilidad', selectedDisponibilidad);
    setSearchParams(params, { replace: true });
  }, [selectedPlaza, selectedTipo, selectedDisponibilidad, setSearchParams]);

  // Handle URL changes from outside (e.g., browser back button)
  useEffect(() => {
    if (plazaParam && plazaParam !== selectedPlaza) {
      setSelectedPlaza(plazaParam);
    }
    if (tipoParam && tipoParam !== selectedTipo) {
      setSelectedTipo(tipoParam);
    }
    if (dispParam && dispParam !== selectedDisponibilidad) {
      setSelectedDisponibilidad(dispParam);
    }
  }, [plazaParam, tipoParam, dispParam]);

  const query = searchText.trim().toLowerCase();

  const matchesSearch = (item: InventoryItem) => {
    if (!query) return true;
    const haystack = [
      item.name,
      item.canonical_id,
      item.tipo_soporte,
      item.ciudad,
      'address' in item ? item.address : '',
    ].join(' ').toLowerCase();
    return haystack.includes(query);
  };

  const matchesDisponibilidad = (item: InventoryItem) => {
    if (selectedDisponibilidad === 'todos') return true;
    const disponibilidad = item.disponibilidad ?? 'disponible';
    return disponibilidad === selectedDisponibilidad;
  };

  const filteredLocations = fixedLocations.filter((loc) => {
    const matchPlaza = selectedPlaza === 'todos' || loc.ciudad === selectedPlaza;
    const matchTipo = selectedTipo === 'todos' || loc.tipo_soporte === selectedTipo;
    return matchPlaza && matchTipo && matchesDisponibilidad(loc) && matchesSearch(loc);
  });

  const filteredRoutes = mobileRoutes.filter((route) => {
    const matchPlaza = selectedPlaza === 'todos' || route.ciudad === selectedPlaza;
    const matchTipo = selectedTipo === 'todos' || route.tipo_soporte === selectedTipo;
    return matchPlaza && matchTipo && matchesDisponibilidad(route) && matchesSearch(route);
  });

  const selectedItems = getSelectedItems(allItems);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-gray-50">
        <div className="text-center flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-black" />
          <p className="text-sm font-semibold text-gray-600">Cargando inventario comercial desde base de datos...</p>
        </div>
      </div>
    );
  }

  // Error state (No silent mock fallback as per Phase 12)
  if (error) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Error de conexión con la Base de Datos</h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <Button onClick={refetch} className="w-full flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Reintentar conexión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] relative overflow-hidden">
      {/* Mobile Filter Toggle Button */}
      <div className="md:hidden absolute top-4 left-4 z-[500]">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="bg-white text-black px-4 py-2.5 rounded-full font-bold shadow-lg border border-gray-100 flex items-center gap-2 text-sm active:scale-95 transition-transform"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {(selectedPlaza !== 'todos' || selectedTipo !== 'todos' || selectedDisponibilidad !== 'todos' || searchText) && (
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-0 right-0 m-2"></span>
          )}
        </button>
      </div>

      {/* Filter Panel (Desktop Static / Mobile Drawer) */}
      <div
        className={cn(
          'absolute md:relative inset-0 md:inset-auto z-[2000] md:z-10 bg-black/40 md:bg-transparent transition-opacity duration-300 md:opacity-100 md:block',
          isMobileFiltersOpen ? 'opacity-100 block' : 'opacity-0 hidden'
        )}
      >
        <div className="absolute md:relative inset-y-0 left-0 w-[85%] max-w-sm md:w-80 h-full bg-white flex flex-col shadow-2xl md:shadow-none border-r border-gray-200">
          {/* Mobile Drawer Header */}
          <div className="md:hidden p-4 flex justify-between items-center border-b border-gray-100">
            <span className="font-bold text-lg">Filtros</span>
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto">
            <MapFilterPanel
              selectedPlaza={selectedPlaza}
              setSelectedPlaza={setSelectedPlaza}
              selectedTipo={selectedTipo}
              setSelectedTipo={setSelectedTipo}
              selectedDisponibilidad={selectedDisponibilidad}
              setSelectedDisponibilidad={setSelectedDisponibilidad}
              searchText={searchText}
              setSearchText={setSearchText}
              resultsCount={filteredLocations.length + filteredRoutes.length}
              onOpenMediakit={handleOpenMediakit}
            />
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-grow h-full relative z-0">
        <InventoryMap
          locations={filteredLocations}
          routes={filteredRoutes}
          onOpenMediakit={handleOpenMediakit}
          initialSelectedId={searchParams.get('soporte')}
          selectedPlaza={selectedPlaza}
          onResetFilters={handleResetFilters}
          onResetToPlaza={selectedPlaza !== 'todos' ? handleResetToPlaza : undefined}
        />

        {/* Global Sticky Selection Bar */}
        <StickySelectionBar
          onOpenMediakit={handleOpenMediakit}
          currentPlaza={selectedPlaza}
        />

        {/* Lightweight Selection Toast Feedback */}
        <SelectionToast />

        {/* Mediakit Request Panel Modal */}
        {isMediakitOpen && (
          <MediakitPanel
            selectedItems={selectedItems}
            onClose={() => setIsMediakitOpen(false)}
            onGoToInventory={() => setIsMediakitOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
