import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import InventoryMap from '../components/map/InventoryMap';
import { MediakitPanel } from '../components/map/MediakitPanel';
import { StickySelectionBar } from '../components/map/StickySelectionBar';
import { useInventory } from '../hooks/useInventory';
import { Plaza, TipoSoporte, Disponibilidad, InventoryItem } from '../types';
import { MapFilterPanel } from '../components/map/MapFilterPanel';
import { ViewModeToggle, ViewMode } from '../components/inventory/ViewModeToggle';
import { SupportCardGrid } from '../components/inventory/SupportCardGrid';
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
  const vistaParam = searchParams.get('vista') as ViewMode | null;

  const [selectedPlaza, setSelectedPlaza] = useState<Plaza | 'todos'>(plazaParam || 'todos');
  const [selectedTipo, setSelectedTipo] = useState<TipoSoporte | 'todos'>(tipoParam || 'todos');
  const [selectedDisponibilidad, setSelectedDisponibilidad] = useState<DisponibilidadFilter>(dispParam || 'todos');
  const [viewMode, setViewMode] = useState<ViewMode>(vistaParam === 'catalogo' ? 'catalogo' : 'mapa');
  const [selectedSoporteId, setSelectedSoporteId] = useState<string | null>(searchParams.get('soporte'));
  const [searchText, setSearchText] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMediakitOpen, setIsMediakitOpen] = useState(false);

  const { selectedCount, showToast, getSelectedItems } = useSelection();

  const handleOpenMediakit = useCallback(() => {
    if (selectedCount === 0) {
      showToast('Selecciona al menos un soporte para armar tu propuesta.', undefined, 2800);
      return;
    }
    setIsMediakitOpen(true);
    setIsMobileFiltersOpen(false);
  }, [selectedCount, showToast]);

  const handleResetFilters = useCallback(() => {
    setSelectedPlaza('todos');
    setSelectedTipo('todos');
    setSelectedDisponibilidad('todos');
    setSearchText('');
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const handleSelectOnMap = useCallback((item: InventoryItem) => {
    setSelectedSoporteId(item.canonical_id);
    setViewMode('mapa');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('soporte', item.canonical_id);
      next.set('vista', 'mapa');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedPlaza !== 'todos') params.set('plaza', selectedPlaza);
    if (selectedTipo !== 'todos') params.set('tipo', selectedTipo);
    if (selectedDisponibilidad !== 'todos') params.set('disponibilidad', selectedDisponibilidad);
    if (viewMode !== 'mapa') params.set('vista', viewMode);
    if (selectedSoporteId && viewMode === 'mapa') params.set('soporte', selectedSoporteId);
    setSearchParams(params, { replace: true });
  }, [selectedPlaza, selectedTipo, selectedDisponibilidad, viewMode, selectedSoporteId, setSearchParams]);

  useEffect(() => {
    if (plazaParam && plazaParam !== selectedPlaza) setSelectedPlaza(plazaParam);
    if (tipoParam && tipoParam !== selectedTipo) setSelectedTipo(tipoParam);
    if (dispParam && dispParam !== selectedDisponibilidad) setSelectedDisponibilidad(dispParam);
    if (vistaParam && (vistaParam === 'mapa' || vistaParam === 'catalogo') && vistaParam !== viewMode) {
      setViewMode(vistaParam);
    }
  }, [plazaParam, tipoParam, dispParam, vistaParam]);

  const query = searchText.trim().toLowerCase();

  const matchesSearch = useCallback((item: InventoryItem) => {
    if (!query) return true;
    const haystack = [
      item.name,
      item.canonical_id,
      item.tipo_soporte,
      item.ciudad,
      'address' in item ? item.address : '',
    ].join(' ').toLowerCase();
    return haystack.includes(query);
  }, [query]);

  const matchesDisponibilidad = useCallback((item: InventoryItem) => {
    if (selectedDisponibilidad === 'todos') return true;
    const disponibilidad = item.disponibilidad ?? 'disponible';
    return disponibilidad === selectedDisponibilidad;
  }, [selectedDisponibilidad]);

  const filteredLocations = useMemo(() => {
    return fixedLocations.filter((loc) => {
      const matchPlaza = selectedPlaza === 'todos' || loc.ciudad === selectedPlaza;
      const matchTipo = selectedTipo === 'todos' || loc.tipo_soporte === selectedTipo;
      return matchPlaza && matchTipo && matchesDisponibilidad(loc) && matchesSearch(loc);
    });
  }, [fixedLocations, selectedPlaza, selectedTipo, matchesDisponibilidad, matchesSearch]);

  const filteredRoutes = useMemo(() => {
    return mobileRoutes.filter((route) => {
      const matchPlaza = selectedPlaza === 'todos' || route.ciudad === selectedPlaza;
      const matchTipo = selectedTipo === 'todos' || route.tipo_soporte === selectedTipo;
      return matchPlaza && matchTipo && matchesDisponibilidad(route) && matchesSearch(route);
    });
  }, [mobileRoutes, selectedPlaza, selectedTipo, matchesDisponibilidad, matchesSearch]);

  const allFilteredItems = useMemo(() => {
    return [...filteredLocations, ...filteredRoutes];
  }, [filteredLocations, filteredRoutes]);

  const selectedItems = getSelectedItems(allItems);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-gray-50" role="status" aria-live="polite">
        <div className="text-center flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-black" aria-hidden="true" />
          <p className="text-sm font-semibold text-gray-600">Cargando inventario comercial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-gray-50 px-4" role="alert">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">No pudimos cargar el inventario</h2>
          <p className="text-sm text-gray-600 mb-6">Estamos teniendo problemas para mostrar los soportes. Probá nuevamente.</p>
          <Button onClick={refetch} className="w-full flex items-center justify-center gap-2" aria-label="Reintentar cargar el inventario">
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const hasActiveFilters = selectedPlaza !== 'todos' || selectedTipo !== 'todos' || selectedDisponibilidad !== 'todos' || Boolean(searchText);

  return (
    <div className="flex h-[calc(100vh-80px)] relative overflow-hidden">
      {/* Controles flotantes superiores en Mobile */}
      <div className="md:hidden absolute top-4 left-4 right-4 z-[500] flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="pointer-events-auto bg-white text-black px-4 py-2 rounded-full font-bold shadow-lg border border-gray-100 flex items-center gap-2 text-xs active:scale-95 transition-transform"
          aria-label={hasActiveFilters ? 'Abrir filtros, hay filtros activos' : 'Abrir filtros'}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Filtros</span>
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />}
        </button>

        <div className="pointer-events-auto">
          <ViewModeToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
        </div>
      </div>

      {/* Drawer / Sidebar de Filtros */}
      <div
        className={cn(
          'absolute md:relative inset-0 md:inset-auto z-[2000] md:z-10 bg-black/40 md:bg-transparent transition-opacity duration-300 md:opacity-100 md:block',
          isMobileFiltersOpen ? 'opacity-100 block' : 'opacity-0 hidden'
        )}
        role={isMobileFiltersOpen ? 'dialog' : undefined}
        aria-modal={isMobileFiltersOpen ? true : undefined}
        aria-label={isMobileFiltersOpen ? 'Filtros de inventario' : undefined}
      >
        <div className="absolute md:relative inset-y-0 left-0 w-[85%] max-w-sm md:w-80 h-full bg-white flex flex-col shadow-2xl md:shadow-none border-r border-gray-200">
          <div className="md:hidden p-4 flex justify-between items-center border-b border-gray-100">
            <span className="font-bold text-base">Filtros</span>
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(false)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Cerrar filtros"
            >
              <X className="w-4 h-4" aria-hidden="true" />
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
              resultsCount={allFilteredItems.length}
            />
          </div>
        </div>
      </div>

      {/* Área Principal de Contenido (Mapa ↔ Catálogo) */}
      <div className="flex-grow h-full relative z-0 flex flex-col">
        {/* Barra superior en Desktop con selector de vista */}
        <div className="hidden md:flex absolute top-4 right-6 z-[500] items-center gap-3">
          <ViewModeToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
        </div>

        {viewMode === 'mapa' ? (
          <InventoryMap
            locations={filteredLocations}
            routes={filteredRoutes}
            onOpenMediakit={handleOpenMediakit}
            initialSelectedId={selectedSoporteId || searchParams.get('soporte')}
            selectedPlaza={selectedPlaza}
            onResetFilters={handleResetFilters}
          />
        ) : (
          <SupportCardGrid
            items={allFilteredItems}
            onSelectOnMap={handleSelectOnMap}
            onResetFilters={handleResetFilters}
          />
        )}

        <StickySelectionBar
          onOpenMediakit={handleOpenMediakit}
          currentPlaza={selectedPlaza}
          inventoryItems={allItems}
        />

        {isMediakitOpen && (
          <MediakitPanel
            selectedItems={selectedItems}
            onClose={() => setIsMediakitOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
