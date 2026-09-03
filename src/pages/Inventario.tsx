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
    const haystack = [item.name, item.canonical_id, item.tipo_soporte, item.ciudad, 'address' in item ? item.address : ''].join(' ').toLowerCase();
    return haystack.includes(query);
  }, [query]);

  const matchesDisponibilidad = useCallback((item: InventoryItem) => {
    if (selectedDisponibilidad === 'todos') return true;
    const disponibilidad = item.disponibilidad ?? 'disponible';
    return disponibilidad === selectedDisponibilidad;
  }, [selectedDisponibilidad]);

  const filteredLocations = useMemo(() => fixedLocations.filter((loc) => {
    const matchPlaza = selectedPlaza === 'todos' || loc.ciudad === selectedPlaza;
    const matchTipo = selectedTipo === 'todos' || loc.tipo_soporte === selectedTipo;
    return matchPlaza && matchTipo && matchesDisponibilidad(loc) && matchesSearch(loc);
  }), [fixedLocations, selectedPlaza, selectedTipo, matchesDisponibilidad, matchesSearch]);

  const filteredRoutes = useMemo(() => mobileRoutes.filter((route) => {
    const matchPlaza = selectedPlaza === 'todos' || route.ciudad === selectedPlaza;
    const matchTipo = selectedTipo === 'todos' || route.tipo_soporte === selectedTipo;
    return matchPlaza && matchTipo && matchesDisponibilidad(route) && matchesSearch(route);
  }), [mobileRoutes, selectedPlaza, selectedTipo, matchesDisponibilidad, matchesSearch]);

  const allFilteredItems = useMemo(() => [...filteredLocations, ...filteredRoutes], [filteredLocations, filteredRoutes]);
  const selectedItems = getSelectedItems(allItems);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-50" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-gray-900" aria-hidden="true" />
          <p className="text-sm font-semibold text-gray-600">Cargando inventario comercial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4" role="alert">
        <div className="w-full max-w-md border border-gray-200 bg-white p-6 text-center">
          <AlertCircle className="mx-auto h-5 w-5 text-red-600" aria-hidden="true" />
          <h2 className="mb-2 mt-3 text-lg font-bold text-gray-900">No pudimos cargar el inventario</h2>
          <p className="mb-5 text-sm text-gray-600">Estamos teniendo problemas para mostrar los soportes. Probá nuevamente.</p>
          <Button onClick={refetch} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg" aria-label="Reintentar cargar el inventario">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const hasActiveFilters = selectedPlaza !== 'todos' || selectedTipo !== 'todos' || selectedDisponibilidad !== 'todos' || Boolean(searchText);

  return (
    <div className="relative flex h-[calc(100vh-64px)] overflow-hidden">
      <div className="pointer-events-none absolute left-3 right-3 top-3 z-[500] flex items-center justify-between gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="pointer-events-auto flex min-h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-950"
          aria-label={hasActiveFilters ? 'Abrir filtros, hay filtros activos' : 'Abrir filtros'}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-gray-600" aria-hidden="true" />
          <span>Filtros</span>
          {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />}
        </button>
        <div className="pointer-events-auto shrink-0">
          <ViewModeToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
        </div>
      </div>

      <div
        className={cn(
          'absolute inset-0 z-[2000] bg-black/30 transition-opacity duration-200 md:relative md:inset-auto md:z-10 md:block md:bg-transparent md:opacity-100',
          isMobileFiltersOpen ? 'block opacity-100' : 'hidden opacity-0'
        )}
        role={isMobileFiltersOpen ? 'dialog' : undefined}
        aria-modal={isMobileFiltersOpen ? true : undefined}
        aria-label={isMobileFiltersOpen ? 'Filtros de inventario' : undefined}
      >
        <div className="absolute inset-y-0 left-0 flex h-full w-[85%] max-w-sm flex-col border-r border-gray-200 bg-white md:relative md:w-80">
          <div className="flex items-center justify-between border-b border-gray-100 p-4 md:hidden">
            <span className="text-sm font-bold">Filtros</span>
            <button type="button" onClick={() => setIsMobileFiltersOpen(false)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100" aria-label="Cerrar filtros">
              <X className="h-4 w-4" aria-hidden="true" />
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
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />
          </div>
        </div>
      </div>

      <div className={cn('relative z-0 flex h-full flex-grow flex-col', viewMode === 'catalogo' && 'pt-14 md:pt-0')}>
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
          <SupportCardGrid items={allFilteredItems} onSelectOnMap={handleSelectOnMap} onResetFilters={handleResetFilters} />
        )}

        <StickySelectionBar onOpenMediakit={handleOpenMediakit} currentPlaza={selectedPlaza} inventoryItems={allItems} />

        {isMediakitOpen && <MediakitPanel selectedItems={selectedItems} onClose={() => setIsMediakitOpen(false)} />}
      </div>
    </div>
  );
}
