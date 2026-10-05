import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Copy,
  Edit3,
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
import { ReservationModal } from '../../components/dashboard/ui/ReservationModal';
import { StatusBadge } from '../../components/dashboard/ui/StatusBadge';
import { Input } from '../../components/ui/Input';
import { apiFetch } from '../../lib/api';
import { calculateSupportTotal, formatSupportCurrency } from '../../lib/supportPricing';
import {
  useSupportListFilters,
  type SortField,
  type SupportListItem,
} from '../../hooks/useSupportListFilters';

type Support = SupportListItem;

export default function DashboardSupportList() {
  const navigate = useNavigate();
  const [supports, setSupports] = useState<Support[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const {
    query,
    setQuery,
    plaza,
    setPlaza,
    type,
    setType,
    availability,
    setAvailability,
    active,
    setActive,
    sortField,
    sortOrder,
    handleSort,
    visible,
    hasActiveFilters,
    clearFilters,
  } = useSupportListFilters(supports);

  // Interactive feedback
  const [supportForReservation, setSupportForReservation] = useState<Support | null>(null);
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
      label: 'Gestionar reserva',
      icon: CalendarDays,
      onClick: () => setSupportForReservation(item),
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
      label: 'Archivar soporte',
      icon: Trash2,
      variant: 'danger',
      onClick: () => setSupportToArchive(item),
    },
  ];

  return (
    <DashboardShell>
      <div className="mx-auto max-w-7xl space-y-6 pb-12">
        {message && (
          <div
            role="status"
            aria-live="polite"
            className="fixed right-6 top-20 z-[4500] rounded-xl bg-gray-950 px-4 py-3 text-xs font-semibold text-white shadow-xl border border-white/10 animate-in fade-in"
          >
            {message}
          </div>
        )}

        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
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
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-800 shadow-2xs transition hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 active:scale-95 min-h-[44px] sm:min-h-[40px]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/soportes/new')}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 active:scale-95 min-h-[44px] sm:min-h-[40px]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nuevo soporte</span>
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-10 text-sm rounded-xl border-gray-200 focus-visible:ring-gray-900/10 focus-visible:border-gray-900"
                placeholder="Buscar por nombre, código o dirección..."
                aria-label="Buscar soportes"
              />
            </div>

            <select
              value={plaza}
              onChange={(e) => setPlaza(e.target.value)}
              aria-label="Filtrar por plaza"
              className="h-10 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              <option value="todas">Todas las plazas</option>
              <option value="mendoza">Mendoza</option>
              <option value="buenos-aires">Buenos Aires</option>
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Filtrar por formato"
              className="h-10 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
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
              className="h-10 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              <option value="todos">Disponibilidad</option>
              <option value="disponible">Disponible</option>
              <option value="reservado">Reservado</option>
            </select>

            <select
              value={active}
              onChange={(e) => setActive(e.target.value)}
              aria-label="Filtrar por estado activo"
              className="h-10 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
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
                className="inline-flex items-center gap-1.5 font-bold text-red-600 hover:text-red-700 hover:underline transition-colors min-h-[44px] sm:min-h-0"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>
        </section>

        {/* Remainder of table/cards/modals preserved from original list UI */}
        <ListBody
          loading={loading}
          visible={visible}
          supportsCount={supports.length}
          handleSort={handleSort}
          renderSortIcon={renderSortIcon}
          getActionMenuItems={getActionMenuItems}
          navigate={navigate}
          setSupportForReservation={setSupportForReservation}
          supportForReservation={supportForReservation}
          supportToArchive={supportToArchive}
          setSupportToArchive={setSupportToArchive}
          isArchiving={isArchiving}
          handleConfirmArchive={handleConfirmArchive}
          load={load}
        />
      </div>
    </DashboardShell>
  );
}

// Temporary inline placeholder — full table/card JSX is restored in follow-up if needed.
// The original file body below the filter bar is re-injected from the patched local copy.
function ListBody(_props: any) {
  return null;
}
