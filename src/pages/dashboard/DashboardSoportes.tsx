import { useMemo, useState, useEffect } from 'react';
import {
  Search,
  Plus,
  ExternalLink,
  CheckCircle2,
  Eye,
  LayoutGrid,
  List,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { Button } from '../../components/ui/Button';
import { Input, Label } from '../../components/ui/Input';
import {
  listInventory,
  getAddress,
} from '../../lib/dashboard-utils';
import {
  setInventoryOverride,
} from '../../lib/dashboard-store';
import {
  getDisponibilidad,
  type Disponibilidad,
  type InventoryItem,
  type Plaza,
  type TipoSoporte,
} from '../../types';

export default function DashboardSoportes() {
  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState<'todos' | Disponibilidad>('todos');
  const [plaza, setPlaza] = useState<'todas' | Plaza>('todas');
  const [tipo, setTipo] = useState<'todos' | TipoSoporte>('todos');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [refreshKey, setRefreshKey] = useState(0);
  const [toastMessage, setToastMessage] = useState('');

  // Selected Item for Detail Modal
  const [selectedSupport, setSelectedSupport] = useState<InventoryItem | null>(null);

  // New Support Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPlaza, setNewPlaza] = useState<Plaza>('mendoza');
  const [newTipo, setNewTipo] = useState<TipoSoporte>('led');
  const [newAddress, setNewAddress] = useState('');
  const [newFormat, setNewFormat] = useState('6.00 x 3.00 mts');
  const [newSuccessMsg, setNewSuccessMsg] = useState('');

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedSupport(null);
        setIsAddModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  // Items derived from store
  const items = useMemo(() => {
    return listInventory({
      query,
      availability,
      plaza,
      tipo,
    });
  }, [query, availability, plaza, tipo, refreshKey]);

  const handleToggleAvailability = (item: InventoryItem) => {
    const current = getDisponibilidad(item);
    const next: Disponibilidad = current === 'disponible' ? 'reservado' : 'disponible';
    setInventoryOverride(item.canonical_id, next);
    setRefreshKey((prev) => prev + 1);
    showToast(`Soporte "${item.name}" marcado como ${next === 'disponible' ? 'Disponible' : 'Reservado'}`);
  };

  const handleCreateSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAddress.trim()) return;

    // Simulate creation in override store
    const generatedId = `${newPlaza === 'mendoza' ? 'mza' : 'bue'}-${newTipo === 'led' ? 'led' : newTipo === 'led_movil' ? 'mob' : 'trad'}-${Date.now().toString().slice(-4)}`;
    setInventoryOverride(generatedId, 'disponible');

    setNewSuccessMsg(`Soporte "${newName}" agregado exitosamente al catálogo.`);
    setTimeout(() => {
      setNewSuccessMsg('');
      setIsAddModalOpen(false);
      setNewName('');
      setNewAddress('');
      setRefreshKey((prev) => prev + 1);
    }, 1200);
  };

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-6xl">
        {/* Toast alert */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-eyebrow text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                Inventario
              </span>
            </div>
            <h1 className="mt-2 text-page-title text-gray-900">
              Gestión de Soportes
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Supervisión de ubicaciones, formatos técnicos y control de disponibilidad en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Soporte</span>
            </button>
            <Link
              to="/inventario"
              className="px-4 py-2.5 bg-white text-gray-700 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver en Mapa</span>
            </Link>
          </div>
        </header>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, código o calle..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 text-xs font-medium outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10"
              />
            </div>

            {/* Plaza Filter */}
            <select
              value={plaza}
              onChange={(e) => setPlaza(e.target.value as typeof plaza)}
              className="h-10 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs font-semibold text-gray-700 outline-none focus:border-emerald-600 focus:bg-white"
            >
              <option value="todas">Todas las Plazas</option>
              <option value="mendoza">Mendoza</option>
              <option value="buenos-aires">Buenos Aires</option>
            </select>

            {/* Tipo Filter */}
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as typeof tipo)}
              className="h-10 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs font-semibold text-gray-700 outline-none focus:border-emerald-600 focus:bg-white"
            >
              <option value="todos">Todos los Formatos</option>
              <option value="tradicional">Cartelería Tradicional</option>
              <option value="led">Pantallas LED Digitales</option>
              <option value="led_movil">LED Móvil & Circuitos</option>
            </select>

            {/* Disponibilidad Filter */}
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as typeof availability)}
              className="h-10 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs font-semibold text-gray-700 outline-none focus:border-emerald-600 focus:bg-white"
            >
              <option value="todos">Todas las Disponibilidades</option>
              <option value="disponible">Disponibles</option>
              <option value="reservado">Reservados</option>
            </select>
          </div>

          {/* Results summary & View Toggle */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">{items.length}</span>
              <span>soportes encontrados</span>
              {(query || plaza !== 'todas' || tipo !== 'todos' || availability !== 'todos') && (
                <button
                  onClick={() => {
                    setQuery('');
                    setPlaza('todas');
                    setTipo('todos');
                    setAvailability('todos');
                  }}
                  className="text-emerald-700 font-bold hover:underline ml-2"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors ${
                  viewMode === 'table' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Vista de tabla"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabla</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Vista de tarjetas"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content View: Table or Grid */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="py-3.5 px-4">Soporte / Código</th>
                    <th className="py-3.5 px-4">Plaza & Tipo</th>
                    <th className="py-3.5 px-4">Ubicación</th>
                    <th className="py-3.5 px-4">Disponibilidad (Click para cambiar)</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const disp = getDisponibilidad(item);
                    return (
                      <tr key={item.canonical_id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                          <div className="font-mono text-[11px] text-gray-400">{item.canonical_id}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-gray-700 block">
                            {item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}
                          </span>
                          <span className="text-[11px] text-gray-500 capitalize">
                            {item.tipo_soporte.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-gray-600">
                          {getAddress(item)}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(item)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                              disp === 'disponible'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                            title="Haz clic para alternar disponibilidad en tiempo real"
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                disp === 'disponible' ? 'bg-emerald-600' : 'bg-amber-600'
                              }`}
                            />
                            {disp === 'disponible' ? 'Disponible' : 'Reservado'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedSupport(item)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                              title="Ver ficha técnica"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/inventario?soporte=${encodeURIComponent(item.canonical_id)}`}
                              className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 transition-colors"
                              title="Ver en mapa público"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400">
                        No se encontraron soportes con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const disp = getDisponibilidad(item);
              return (
                <div
                  key={item.canonical_id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs flex flex-col justify-between hover:border-gray-300 transition-all"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] text-gray-400 block font-bold">
                          {item.canonical_id}
                        </span>
                        <h3 className="font-bold text-sm text-gray-900 mt-0.5">{item.name}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          disp === 'disponible'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                        title="Clic para cambiar estado"
                      >
                        {disp === 'disponible' ? 'Disponible' : 'Reservado'}
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2">
                      {getAddress(item)}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-600">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-md font-semibold">
                        {item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}
                      </span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded-md capitalize">
                        {item.tipo_soporte.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedSupport(item)}
                      className="text-xs font-bold text-gray-700 hover:text-black"
                    >
                      Ficha Técnica
                    </button>
                    <Link
                      to={`/inventario?soporte=${encodeURIComponent(item.canonical_id)}`}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <span>Mapa</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Support Technical Detail */}
        {selectedSupport && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-gray-400">
                    {selectedSupport.canonical_id}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">{selectedSupport.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedSupport(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 font-bold uppercase text-[9px] block">Plaza</span>
                    <span className="text-sm font-bold text-gray-900 mt-0.5 block capitalize">
                      {selectedSupport.ciudad}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 font-bold uppercase text-[9px] block">Tipo de Soporte</span>
                    <span className="text-sm font-bold text-gray-900 mt-0.5 block capitalize">
                      {selectedSupport.tipo_soporte.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-gray-400 font-bold uppercase text-[9px] block">Ubicación exacta</span>
                  <p className="text-xs font-semibold text-gray-800 mt-1">
                    {getAddress(selectedSupport)}
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div>
                    <span className="text-emerald-900 font-bold block">Estado Comercial</span>
                    <span className="text-[11px] text-emerald-700">
                      Actualmente {getDisponibilidad(selectedSupport)} para contratación.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleToggleAvailability(selectedSupport);
                      setSelectedSupport((prev) =>
                        prev
                          ? {
                              ...prev,
                              disponibilidad:
                                getDisponibilidad(prev) === 'disponible' ? 'reservado' : 'disponible',
                            }
                          : null
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors shadow-2xs"
                  >
                    Alternar Estado
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Link
                  to={`/inventario?soporte=${encodeURIComponent(selectedSupport.canonical_id)}`}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                >
                  <span>Abrir en Mapa Público</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add New Support Demo */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Agregar Nuevo Soporte</h2>
                  <p className="text-xs text-gray-500">Alta de ubicación para el catálogo comercial.</p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {newSuccessMsg ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {newSuccessMsg}
                </div>
              ) : (
                <form onSubmit={handleCreateSupport} className="space-y-3.5 text-xs">
                  <div>
                    <Label htmlFor="new-name">Nombre del Soporte</Label>
                    <Input
                      id="new-name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ej. Pantalla Peatonal San Martín"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="new-plaza">Plaza</Label>
                      <select
                        id="new-plaza"
                        value={newPlaza}
                        onChange={(e) => setNewPlaza(e.target.value as Plaza)}
                        className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-600"
                      >
                        <option value="mendoza">Mendoza</option>
                        <option value="buenos-aires">Buenos Aires</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="new-tipo">Tipo</Label>
                      <select
                        id="new-tipo"
                        value={newTipo}
                        onChange={(e) => setNewTipo(e.target.value as TipoSoporte)}
                        className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-600"
                      >
                        <option value="led">Pantalla LED</option>
                        <option value="tradicional">Tradicional</option>
                        <option value="led_movil">LED Móvil</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="new-address">Dirección / Punto Clave</Label>
                    <Input
                      id="new-address"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Ej. Av. San Martín y Garibaldi"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-format">Formato / Medidas</Label>
                    <Input
                      id="new-format"
                      value={newFormat}
                      onChange={(e) => setNewFormat(e.target.value)}
                      placeholder="Ej. 8.00 x 4.00 mts"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <Button type="submit">
                      Guardar Soporte
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
