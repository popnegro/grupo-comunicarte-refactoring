import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  Plus,
  RefreshCw,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Inbox,
  FilterX,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { ActionMenu, ActionMenuItem } from '../../components/dashboard/ui/ActionMenu';
import { ConfirmDialog } from '../../components/dashboard/ui/ConfirmDialog';
import { StatusBadge } from '../../components/dashboard/ui/StatusBadge';
import { Input } from '../../components/ui/Input';
import { apiFetch } from '../../lib/api';
import { calculateSupportTotal, formatSupportCurrency } from '../../lib/supportPricing';

type Support = {
  canonical_id: string;
  name: string;
  ciudad: string;
  tipo_soporte: string;
  disponibilidad: string;
  active?: boolean;
  address?: string;
  pricing?: {
    exhibition_price?: number | string | null;
    installation_price?: number | string | null;
    printing_price?: number | string | null;
    currency?: string | null;
  } | null;
};

type SortField = 'name' | 'ciudad' | 'tipo_soporte' | 'disponibilidad' | 'price';
type SortOrder = 'asc' | 'desc';

export default function DashboardSupportList() {
  const navigate = useNavigate();
  const [supports, setSupports] = useState<Support[]>([]);
  const [query, setQuery] = useState('');
  const [plaza, setPlaza] = useState('todas');
  const [type, setType] = useState('todos');
  const [availability, setAvailability] = useState('todos');
  const [active, setActive] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Interactive feedback
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [supportToArchive, setSupportToArchive] = useState<Support | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3000);
  };

  const load = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/supports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/login');
        return;
      }
      const json = await res.json();
      if (!res.ok || json.status !== 'success') {
        throw new Error(json.message || 'No se pudo cargar el inventario.');
      }
      setSupports(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      notify(e instanceof Error ? e.message : 'No se pudo cargar el inventario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [navigate]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = supports.filter((item) => {
      const matchQ =
        !q ||
        [item.name, item.canonical_id, item.ciudad, item.address].some((v) =>
          String(v || '')
            .toLowerCase()
            .includes(q)
        );
      const matchPlaza = plaza === 'todas' || item.ciudad === plaza;
      const matchType = type === 'todos' || item.tipo_soporte === type;
      const matchAvailability = availability === 'todos' || item.disponibilidad === availability;
      const matchActive = active === 'todos' || (active === 'activos' ? item.active !== false : item.active === false);
      return matchQ && matchPlaza && matchType && matchAvailability && matchActive;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'ciudad') {
        comparison = (a.ciudad || '').localeCompare(b.ciudad || '');
      } else if (sortField === 'tipo_soporte') {
        comparison = (a.tipo_soporte || '').localeCompare(b.tipo_soporte || '');
      } else if (sortField === 'disponibilidad') {
        comparison = (a.disponibilidad || '').localeCompare(b.disponibilidad || '');
      } else if (sortField === 'price') {
        const totalA = calculateSupportTotal(a.pricing);
        const totalB = calculateSupportTotal(b.pricing);
        comparison = totalA - totalB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [supports, query, plaza, type, availability, active, sortField, sortOrder]);

  const toggleAvailability = async (item: Support) => {
    if (togglingId === item.canonical_id) return;
    const token = localStorage.getItem('admin_token');
    const next = item.disponibilidad === 'disponible' ? 'reservado' : 'disponible';
    setTogglingId(item.canonical_id);

    try {
      const res = await apiFetch(`/api/admin/supports/${encodeURIComponent(item.canonical_id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ disponibilidad: next }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== 'success') {
        notify(json?.message || 'No se pudo cambiar la disponibilidad.');
        return;
      }
      notify(`Soporte marcado como: ${next === 'disponible' ? 'Disponible' : 'Reservado'}.`);
      load();
    } catch (err: any) {
      notify(err.message || 'Error al actualizar disponibilidad.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmArchive = async () => {
    if (!supportToArchive) return;
    const token = localStorage.getItem('admin_token');
    setIsArchiving(true);

    try {
      const res = await apiFetch(`/api/admin/supports/${encodeURIComponent(supportToArchive.canonical_id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== 'success') {
        notify(json?.message || 'No se pudo archivar.');
        return;
      }
      notify(`"${supportToArchive.name}" fue archivado.`);
      setSupportToArchive(null);
      load();
    } catch (err: any) {
      notify(err.message || 'Error al archivar el soporte.');
    } finally {
      setIsArchiving(false);
    }
  };

  const duplicate = async (item: Support) => {
    const token = localStorage.getItem('admin_token');
    try {
      const detailRes = await apiFetch(`/api/admin/supports/${encodeURIComponent(item.canonical_id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const detailJson = await detailRes.json();
      if (!detailRes.ok || detailJson.status !== 'success') {
        throw new Error(detailJson.message || 'No se pudo cargar el soporte.');
      }
      const source = detailJson.data;
      const payload = {
        name: `${source.name || 'Soporte'} - Copia`,
        ciudad: source.ciudad,
        family: source.family,
        tipo_soporte: source.tipo_soporte,
        active: true,
        disponibilidad: 'disponible',
        availableFrom: null,
        isFeatured: false,
        lat: source.lat ?? null,
        lng: source.lng ?? null,
        address: source.address || '',
        description: source.description || '',
        characteristics: source.characteristics || '',
        mapa_url: source.mapa_url || '',
        imageUrls: Array.isArray(source.imageUrls) ? source.imageUrls : [],
        technical: source.technical || {},
        pricing: source.pricing || {},
        ...(source.family === 'led_mobile'
          ? {
              route: {
                ...(source.route || {}),
                routePath: Array.isArray(source.routePath) ? source.routePath : [],
                waypoints: Array.isArray(source.waypoints) ? source.waypoints : [],
              },
            }
          : {}),
      };
      const res = await apiFetch('/api/admin/supports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json.status !== 'success') {
        throw new Error(json.message || 'No se pudo duplicar el soporte.');
      }
      notify('Soporte duplicado correctamente.');
      load();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'No se pudo duplicar el soporte.');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-60 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-gray-950 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-gray-950 font-bold" />
    );
  };

  const getActionMenuItems = (item: Support): ActionMenuItem[] => [
    {
      label: 'Definir Reserva',
      icon: CalendarDays,
      onClick: () => navigate(`/dashboard/soportes/${encodeURIComponent(item.canonical_id)}/reservation`),
    },
    {
      label: 'Previsualizar',
      icon: Eye,
      onClick: () => navigate(`/dashboard/soportes/${encodeURIComponent(item.canonical_id)}/preview`),
    },
    {
      label: 'Duplicar',
      icon: Copy,
      onClick: () => duplicate(item),
    },
    {
      label: 'Ver en Inventario',
      icon: ExternalLink,
      onClick: () => navigate('/inventario'),
    },
    {
      label: 'Archivar soporte',
      icon: Trash2,
      variant: 'danger',
      onClick: () => setSupportToArchive(item),
    },
  ];

  const hasActiveFilters = query || plaza !== 'todas' || type !== 'todos' || availability !== 'todos' || active !== 'todos';

  const clearFilters = () => {
    setQuery('');
    setPlaza('todas');
    setType('todos');
    setAvailability('todos');
    setActive('todos');
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-6 pb-12">
        {message && (
          <div
            role="status"
            aria-live="polite"
            className="fixed right-6 top-20 z-[4500] rounded-xl bg-gray-950 px-4 py-3 text-xs font-semibold text-white shadow-xl border border-white/10 animate-in fade-in"
          >
            {message}
          </div>
        )}

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Inventario OOH & DOOH
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950">
              Gestión de Soportes
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Catálogo administrativo y comercial de ubicaciones y pantallas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={load}
              aria-label="Actualizar listado de soportes"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-800 shadow-2xs transition hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 active:scale-95 min-h-[40px]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/soportes/new')}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 active:scale-95 min-h-[40px]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nuevo soporte</span>
            </button>
          </div>
        </header>

        {/* Filter Bar */}
        <section className="rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-10 text-xs sm:text-sm rounded-xl border-gray-200"
                placeholder="Buscar por nombre, código o dirección..."
                aria-label="Buscar soportes"
              />
            </div>

            <select
              value={plaza}
              onChange={(e) => setPlaza(e.target.value)}
              aria-label="Filtrar por plaza"
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs sm:text-sm font-semibold text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value="todas">Todas las plazas</option>
              <option value="mendoza">Mendoza</option>
              <option value="buenos-aires">Buenos Aires</option>
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Filtrar por formato"
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs sm:text-sm font-semibold text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value="todos">Todos los formatos</option>
              <option value="tradicional">Tradicional</option>
              <option value="led">Pantalla LED</option>
              <option value="led_movil">LED Móvil</option>
            </select>

            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              aria-label="Filtrar por disponibilidad"
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs sm:text-sm font-semibold text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value="todos">Disponibilidad</option>
              <option value="disponible">Disponible</option>
              <option value="reservado">Reservado</option>
            </select>

            <select
              value={active}
              onChange={(e) => setActive(e.target.value)}
              aria-label="Filtrar por estado activo"
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs sm:text-sm font-semibold text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value="todos">Estado</option>
              <option value="activos">Solo activos</option>
              <option value="inactivos">Solo archivados</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>
                Mostrando <strong className="text-gray-950 font-bold">{visible.length}</strong> de{' '}
                <strong className="text-gray-950 font-bold">{supports.length}</strong> soportes
              </span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 font-bold text-red-600 hover:text-red-700 hover:underline transition-colors"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>
        </section>

        {/* Desktop Table View */}
        <section className="hidden md:block overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-600 select-none">
                <tr>
                  <th className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className="group inline-flex items-center gap-1.5 hover:text-gray-950 transition-colors"
                    >
                      <span>Soporte / Código</span>
                      {renderSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleSort('ciudad')}
                      className="group inline-flex items-center gap-1.5 hover:text-gray-950 transition-colors"
                    >
                      <span>Plaza / Formato</span>
                      {renderSortIcon('ciudad')}
                    </button>
                  </th>
                  <th className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleSort('disponibilidad')}
                      className="group inline-flex items-center gap-1.5 hover:text-gray-950 transition-colors"
                    >
                      <span>Disponibilidad</span>
                      {renderSortIcon('disponibilidad')}
                    </button>
                  </th>
                  <th className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleSort('price')}
                      className="group inline-flex items-center gap-1.5 hover:text-gray-950 transition-colors"
                    >
                      <span>Tarifa Total</span>
                      {renderSortIcon('price')}
                    </button>
                  </th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        <span className="font-semibold text-xs text-gray-600">Cargando inventario...</span>
                      </div>
                    </td>
                  </tr>
                ) : visible.length > 0 ? (
                  visible.map((item) => {
                    const isToggling = togglingId === item.canonical_id;
                    const total = calculateSupportTotal(item.pricing);

                    return (
                      <tr
                        key={item.canonical_id}
                        className={`transition-colors ${
                          item.active === false ? 'bg-gray-50/70 opacity-70' : 'hover:bg-gray-50/70'
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-gray-950 text-sm leading-snug">{item.name}</div>
                          <div className="font-mono text-[11px] text-gray-400 mt-0.5">{item.canonical_id}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-bold text-gray-800 text-xs">
                            {item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}
                          </div>
                          <div className="text-[11px] text-gray-500 capitalize mt-0.5">
                            {item.tipo_soporte?.replace('_', ' ')}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isToggling}
                              onClick={() => toggleAvailability(item)}
                              title="Haga clic para alternar disponibilidad"
                              className="focus:outline-none focus:ring-2 focus:ring-gray-900 rounded-full transition-transform active:scale-95"
                            >
                              <StatusBadge
                                status={item.disponibilidad}
                                label={isToggling ? 'Actualizando...' : undefined}
                                size="sm"
                              />
                            </button>
                            {item.active === false && (
                              <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                Archivado
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-extrabold text-gray-950 text-sm">
                            {formatSupportCurrency(total, item.pricing?.currency || 'ARS')}
                          </div>
                          <div className="text-[10px] text-gray-400 font-medium">
                            Exhibición + Instalación + Impresión
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/dashboard/soportes/${encodeURIComponent(item.canonical_id)}/edit`)
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-50 hover:border-gray-300 transition-colors active:scale-95 min-h-[36px]"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>Editar</span>
                            </button>

                            <ActionMenu items={getActionMenuItems(item)} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center text-gray-500">
                      <div className="mx-auto max-w-sm flex flex-col items-center justify-center">
                        {hasActiveFilters ? (
                          <>
                            <FilterX className="w-8 h-8 text-gray-300 mb-2" />
                            <p className="text-sm font-bold text-gray-900">No hay coincidencias con los filtros</p>
                            <p className="text-xs text-gray-500 mt-1 mb-4">
                              Intente cambiar los términos de búsqueda o limpiar los filtros seleccionados.
                            </p>
                            <button
                              type="button"
                              onClick={clearFilters}
                              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-800 hover:bg-gray-50 shadow-2xs"
                            >
                              Limpiar todos los filtros
                            </button>
                          </>
                        ) : (
                          <>
                            <Inbox className="w-8 h-8 text-gray-300 mb-2" />
                            <p className="text-sm font-bold text-gray-900">No hay soportes registrados</p>
                            <p className="text-xs text-gray-500 mt-1 mb-4">
                              Comience creando su primer soporte en el catálogo comercial.
                            </p>
                            <button
                              type="button"
                              onClick={() => navigate('/dashboard/soportes/new')}
                              className="rounded-xl bg-gray-950 px-4 py-2 text-xs font-bold text-white shadow-2xs"
                            >
                              Crear primer soporte
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Mobile Adaptable Card View */}
        <section className="md:hidden space-y-3.5">
          {loading ? (
            <div className="rounded-2xl border border-gray-200/90 bg-white p-8 text-center text-gray-500 shadow-2xs">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
              <span className="text-xs font-semibold">Cargando soportes...</span>
            </div>
          ) : visible.length > 0 ? (
            visible.map((item) => {
              const isToggling = togglingId === item.canonical_id;
              const total = calculateSupportTotal(item.pricing);

              return (
                <div
                  key={item.canonical_id}
                  className={`rounded-2xl border border-gray-200/90 bg-white p-4 shadow-2xs transition-colors ${
                    item.active === false ? 'opacity-70 bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <h3 className="text-sm font-bold text-gray-950 leading-snug">{item.name}</h3>
                      <p className="font-mono text-[11px] text-gray-400 mt-0.5">{item.canonical_id}</p>
                    </div>

                    <ActionMenu items={getActionMenuItems(item)} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-2.5 border-y border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                        Plaza / Formato
                      </span>
                      <span className="font-semibold text-gray-800">
                        {item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'} · {item.tipo_soporte?.replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                        Tarifa Total
                      </span>
                      <span className="font-extrabold text-gray-950">
                        {formatSupportCurrency(total, item.pricing?.currency || 'ARS')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => toggleAvailability(item)}
                      className="focus:outline-none"
                    >
                      <StatusBadge
                        status={item.disponibilidad}
                        label={isToggling ? 'Actualizando...' : undefined}
                        size="sm"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/dashboard/soportes/${encodeURIComponent(item.canonical_id)}/edit`)
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-50 active:scale-95 min-h-[36px]"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-gray-200/90 bg-white p-8 text-center text-gray-500 shadow-2xs">
              <FilterX className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-950">No se encontraron soportes</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-800"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </section>

        {/* Advanced Tool Link */}
        <div className="text-right pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/soportes/advanced')}
            className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
          >
            Herramientas avanzadas del catálogo →
          </button>
        </div>

        {/* Accessible Confirm Dialog for Archiving */}
        <ConfirmDialog
          isOpen={!!supportToArchive}
          title="¿Archivar soporte publicitario?"
          description={`El soporte "${supportToArchive?.name}" (${supportToArchive?.canonical_id}) dejará de estar disponible en el inventario público y circuitos activos.`}
          confirmLabel="Archivar Soporte"
          cancelLabel="Cancelar"
          variant="danger"
          isLoading={isArchiving}
          onConfirm={handleConfirmArchive}
          onCancel={() => setSupportToArchive(null)}
        />
      </div>
    </DashboardShell>
  );
}
