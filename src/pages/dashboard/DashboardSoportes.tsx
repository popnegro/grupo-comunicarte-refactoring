import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, Edit3, ExternalLink, Plus, RefreshCw, Save, Search, Trash2, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { Button } from '../../components/ui/Button';
import { Input, Label, Textarea } from '../../components/ui/Input';
import {
  type Disponibilidad,
  type InventoryItem,
  type Plaza,
  type SupportFamily,
  type SupportMediaItem,
  type SupportMediaType,
  type TipoSoporte,
} from '../../types';
import { apiFetch } from '../../lib/api';

type Mode = 'create' | 'edit';

type EditorSupport = {
  canonical_id: string;
  name: string;
  ciudad: Plaza;
  family: SupportFamily;
  tipo_soporte: TipoSoporte;
  active: boolean;
  disponibilidad: Disponibilidad;
  availableFrom: string;
  isFeatured: boolean;
  lat: string;
  lng: string;
  address: string;
  description: string;
  characteristics: string;
  mapa_url: string;
  imageUrlsText: string;
  technical: {
    summary: string;
    measures: string;
    resolution: string;
    turn_on_schedule: string;
    daily_frequency: string;
    requirements: string;
    spot_duration_seconds: string;
    minimum_daily_outings: string;
    max_advertisers: string;
    route_duration_hours: string;
    operation_days: string;
    video_mode: string;
  };
  pricing: {
    exhibition_price: string;
    installation_price: string;
    printing_price: string;
    monthly_price: string;
    exclusive_price: string;
    currency: 'ARS' | 'USD';
    tax_included: boolean;
    price_public: boolean;
  };
  route: {
    route_name: string;
    route_mode: string;
    schedule: string;
    duration: string;
    hours: string;
    weekdays: string;
    default_route: boolean;
    max_advertisers: string;
    spot_duration_seconds: string;
    minimum_daily_outings: string;
    routePathText: string;
    waypointsText: string;
  };
  mediaDraft: {
    editingId: number | null;
    media_type: SupportMediaType;
    url: string;
    title: string;
    alt: string;
    mime_type: string;
    sort_order: string;
  };
  media: SupportMediaItem[];
};

const emptySupport: EditorSupport = {
  canonical_id: '',
  name: '',
  ciudad: 'mendoza',
  family: 'traditional',
  tipo_soporte: 'tradicional',
  active: true,
  disponibilidad: 'disponible',
  availableFrom: '',
  isFeatured: false,
  lat: '',
  lng: '',
  address: '',
  description: '',
  characteristics: '',
  mapa_url: '',
  imageUrlsText: '',
  technical: {
    summary: '',
    measures: '',
    resolution: '',
    turn_on_schedule: '',
    daily_frequency: '',
    requirements: '',
    spot_duration_seconds: '0',
    minimum_daily_outings: '0',
    max_advertisers: '0',
    route_duration_hours: '0',
    operation_days: '',
    video_mode: '',
  },
  pricing: {
    exhibition_price: '0',
    installation_price: '0',
    printing_price: '0',
    monthly_price: '0',
    exclusive_price: '0',
    currency: 'ARS',
    tax_included: false,
    price_public: false,
  },
  route: {
    route_name: '',
    route_mode: 'led_mobile',
    schedule: '',
    duration: '',
    hours: '',
    weekdays: '',
    default_route: true,
    max_advertisers: '8',
    spot_duration_seconds: '10',
    minimum_daily_outings: '180',
    routePathText: '',
    waypointsText: '',
  },
  mediaDraft: {
    editingId: null,
    media_type: 'image',
    url: '',
    title: '',
    alt: '',
    mime_type: '',
    sort_order: '0',
  },
  media: [],
};

function typeToFamily(tipo: TipoSoporte): SupportFamily {
  if (tipo === 'led') return 'led';
  if (tipo === 'led_movil') return 'led_mobile';
  return 'traditional';
}

function familyToTipo(family: SupportFamily): TipoSoporte {
  if (family === 'led') return 'led';
  if (family === 'led_mobile') return 'led_movil';
  return 'tradicional';
}

function blankEditor(): EditorSupport {
  return structuredClone(emptySupport);
}

function mapItemToEditor(item: any): EditorSupport {
  const media = Array.isArray(item.media) ? item.media : [];
  const imageUrls = Array.isArray(item.imageUrls) ? item.imageUrls : [];
  const pricing = item.pricing || {};
  const technical = item.technical || {};
  const route = item.waypoints || item.routePath ? item : item.route || {};

  return {
    canonical_id: item.canonical_id || '',
    name: item.name || '',
    ciudad: item.ciudad || 'mendoza',
    family: item.family || typeToFamily(item.tipo_soporte || 'tradicional'),
    tipo_soporte: item.tipo_soporte || 'tradicional',
    active: item.active !== false,
    disponibilidad: item.disponibilidad || 'disponible',
    availableFrom: item.availableFrom || '',
    isFeatured: item.isFeatured ?? false,
    lat: item.lat === null || item.lat === undefined ? '' : String(item.lat),
    lng: item.lng === null || item.lng === undefined ? '' : String(item.lng),
    address: item.address || '',
    description: item.description || '',
    characteristics: item.characteristics || '',
    mapa_url: item.mapa_url || '',
    imageUrlsText: imageUrls.join('\n'),
    technical: {
      summary: technical.summary || '',
      measures: technical.measures || '',
      resolution: technical.resolution || '',
      turn_on_schedule: technical.turn_on_schedule || '',
      daily_frequency: technical.daily_frequency || '',
      requirements: technical.requirements || '',
      spot_duration_seconds: String(technical.spot_duration_seconds ?? 0),
      minimum_daily_outings: String(technical.minimum_daily_outings ?? 0),
      max_advertisers: String(technical.max_advertisers ?? 0),
      route_duration_hours: String(technical.route_duration_hours ?? 0),
      operation_days: technical.operation_days || '',
      video_mode: technical.video_mode || '',
    },
    pricing: {
      exhibition_price: String(pricing.exhibition_price ?? 0),
      installation_price: String(pricing.installation_price ?? 0),
      printing_price: String(pricing.printing_price ?? 0),
      monthly_price: String(pricing.monthly_price ?? 0),
      exclusive_price: String(pricing.exclusive_price ?? 0),
      currency: pricing.currency || 'ARS',
      tax_included: pricing.tax_included ?? false,
      price_public: pricing.price_public ?? false,
    },
    route: {
      route_name: route.route_name || '',
      route_mode: route.route_mode || item.family || typeToFamily(item.tipo_soporte || 'tradicional'),
      schedule: route.schedule || item.schedule || '',
      duration: route.duration || item.duration || '',
      hours: route.hours || '',
      weekdays: route.weekdays || '',
      default_route: route.default_route ?? true,
      max_advertisers: String(route.max_advertisers ?? 8),
      spot_duration_seconds: String(route.spot_duration_seconds ?? 10),
      minimum_daily_outings: String(route.minimum_daily_outings ?? 180),
      routePathText: JSON.stringify(route.routePath || item.routePath || [], null, 2),
      waypointsText: JSON.stringify(route.waypoints || item.waypoints || [], null, 2),
    },
    mediaDraft: {
      editingId: null,
      media_type: 'image',
      url: '',
      title: '',
      alt: '',
      mime_type: '',
      sort_order: '0',
    },
    media,
  };
}

function parseJsonArray<T>(value: string, fallback: T[]): T[] {
  const text = value.trim();
  if (!text) return fallback;
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : fallback;
}

function mapCorePayload(editor: EditorSupport) {
  const payload: Record<string, unknown> = {
    name: editor.name.trim(),
    ciudad: editor.ciudad,
    family: editor.family,
    tipo_soporte: editor.tipo_soporte,
    active: editor.active,
    disponibilidad: editor.disponibilidad,
    availableFrom: editor.availableFrom || null,
    isFeatured: editor.isFeatured,
    lat: editor.lat === '' ? null : Number(editor.lat),
    lng: editor.lng === '' ? null : Number(editor.lng),
    address: editor.address,
    description: editor.description,
    characteristics: editor.characteristics,
    mapa_url: editor.mapa_url,
    imageUrls: editor.imageUrlsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),

    technical: {
      summary: editor.technical.summary,
      measures: editor.technical.measures,
      resolution: editor.technical.resolution,
      turn_on_schedule: editor.technical.turn_on_schedule,
      daily_frequency: editor.technical.daily_frequency,
      requirements: editor.technical.requirements,
      spot_duration_seconds: Number(editor.technical.spot_duration_seconds || 0),
      minimum_daily_outings: Number(editor.technical.minimum_daily_outings || 0),
      max_advertisers: Number(editor.technical.max_advertisers || 0),
      route_duration_hours: Number(editor.technical.route_duration_hours || 0),
      operation_days: editor.technical.operation_days,
      video_mode: editor.technical.video_mode,
    },

    pricing: {
      exhibition_price: Number(editor.pricing.exhibition_price || 0),
      installation_price: Number(editor.pricing.installation_price || 0),
      printing_price: Number(editor.pricing.printing_price || 0),
      monthly_price: Number(editor.pricing.monthly_price || 0),
      exclusive_price: Number(editor.pricing.exclusive_price || 0),
      currency: editor.pricing.currency,
      tax_included: editor.pricing.tax_included,
      price_public: editor.pricing.price_public,
    },
  };

  if (editor.family === 'led_mobile') {
    payload.route = {
      route_name: editor.route.route_name,
      route_mode: editor.route.route_mode,
      schedule: editor.route.schedule,
      duration: editor.route.duration,
      hours: editor.route.hours,
      weekdays: editor.route.weekdays,
      default_route: editor.route.default_route,
      max_advertisers: Number(editor.route.max_advertisers || 0),
      spot_duration_seconds: Number(editor.route.spot_duration_seconds || 0),
      minimum_daily_outings: Number(editor.route.minimum_daily_outings || 0),
      routePath: parseJsonArray<[number, number]>(
        editor.route.routePathText,
        []
      ),
      waypoints: parseJsonArray<{
        name: string;
        lat: number | null;
        lng: number | null;
      }>(
        editor.route.waypointsText,
        []
      ),
    };
  }

  return payload;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export default function DashboardSoportes() {
  const navigate = useNavigate();
  const [supports, setSupports] = useState<InventoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState<'todos' | Disponibilidad>('todos');
  const [plaza, setPlaza] = useState<'todas' | Plaza>('todas');
  const [tipo, setTipo] = useState<'todos' | TipoSoporte>('todos');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [toastTone, setToastTone] = useState<'ok' | 'error'>('ok');
  const [editor, setEditor] = useState<EditorSupport | null>(null);
  const [editorMode, setEditorMode] = useState<Mode>('create');
  const [loadingEditor, setLoadingEditor] = useState(false);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('admin_token');

  const showToast = (msg: string, tone: 'ok' | 'error' = 'ok') => {
    setToastMessage(msg);
    setToastTone(tone);
    window.setTimeout(() => setToastMessage(''), 2500);
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    async function fetchSupports() {
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
        if (json.status === 'success') {
          setSupports(Array.isArray(json.data) ? json.data : []);
        }
      } catch (err) {
        console.error('Error fetching admin supports:', err);
        showToast('No se pudo cargar el inventario administrativo.', 'error');
      }
    }

    fetchSupports();
  }, [navigate, refreshKey, token]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return supports.filter((item: any) => {
      const matchQuery =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.canonical_id?.toLowerCase().includes(q) ||
        item.ciudad?.toLowerCase().includes(q) ||
        item.address?.toLowerCase().includes(q);
      const matchAvail = availability === 'todos' || item.disponibilidad === availability;
      const matchPlaza = plaza === 'todas' || item.ciudad === plaza;
      const matchTipo = tipo === 'todos' || item.tipo_soporte === tipo;
      const matchActive =
        activeFilter === 'todos' ||
        (activeFilter === 'activos' && item.active !== false) ||
        (activeFilter === 'inactivos' && item.active === false);
      return matchQuery && matchAvail && matchPlaza && matchTipo && matchActive;
    });
  }, [supports, query, availability, plaza, tipo, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [query, availability, plaza, tipo, activeFilter, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  async function openEditor(mode: Mode, support?: InventoryItem | null) {
    setEditorMode(mode);
    setLoadingEditor(true);
    try {
      if (mode === 'create') {
        setEditor(blankEditor());
      } else if (support) {
        const res = await apiFetch(`/api/admin/supports/${support.canonical_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok || json.status !== 'success') {
          throw new Error(json.message || 'No se pudo cargar el soporte');
        }
        setEditor(mapItemToEditor(json.data));
      }
    } catch (err: any) {
      showToast(err.message || 'Error al abrir soporte', 'error');
    } finally {
      setLoadingEditor(false);
    }
  }

  async function refreshSupportDetail(canonicalId: string) {
    const res = await apiFetch(`/api/admin/supports/${canonicalId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok && json.status === 'success') {
      setEditor(mapItemToEditor(json.data));
    }
  }

  async function submitSupport() {
    if (!editor) return;
    setSaving(true);
    try {
      const payload = mapCorePayload(editor);
      const url = editorMode === 'create' ? '/api/admin/supports' : `/api/admin/supports/${editor.canonical_id}`;
      const method = editorMode === 'create' ? 'POST' : 'PATCH';
      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json.status !== 'success') {
        throw new Error(json.message || 'No se pudo guardar el soporte');
      }
      const savedId = json.data?.canonical_id || json.data?.canonicalId || editor.canonical_id;
      showToast(editorMode === 'create' ? 'Soporte creado correctamente.' : 'Soporte actualizado correctamente.');
      setRefreshKey((v) => v + 1);
      if (savedId) {
        await refreshSupportDetail(savedId);
      }
    } catch (err: any) {
      showToast(err.message || 'Error al guardar el soporte', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item: any) {
    try {
      const next = item.active === false;
      const res = await apiFetch(`/api/admin/supports/${item.canonical_id}`, {
        method: next ? 'PATCH' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: next ? JSON.stringify({ active: true }) : undefined,
      });
      const json = await res.json();
      if (!res.ok || json.status !== 'success') throw new Error(json.message || 'No se pudo cambiar el estado');
      setRefreshKey((v) => v + 1);
      showToast(next ? 'Soporte reactivado.' : 'Soporte desactivado.');
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar el estado', 'error');
    }
  }

  async function duplicateSupport(item: any) {
    try {
      const detailRes = await apiFetch(`/api/admin/supports/${item.canonical_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const detailJson = await detailRes.json();

      if (!detailRes.ok || detailJson.status !== 'success') {
        throw new Error(detailJson.message || 'No se pudo cargar el soporte para duplicar.');
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || json.status !== 'success') {
        throw new Error(json.message || 'No se pudo duplicar el soporte.');
      }

      setRefreshKey((v) => v + 1);
      showToast('Soporte duplicado correctamente.');
    } catch (err: any) {
      showToast(err.message || 'Error al duplicar soporte.', 'error');
    }
  }

  async function toggleAvailability(item: any) {
    try {
      const next = item.disponibilidad === 'disponible' ? 'reservado' : 'disponible';
      const res = await apiFetch(`/api/admin/supports/${item.canonical_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ disponibilidad: next }),
      });
      const json = await res.json();
      if (!res.ok || json.status !== 'success') throw new Error(json.message || 'No se pudo cambiar disponibilidad');
      setRefreshKey((v) => v + 1);
      showToast(`Disponibilidad cambiada a ${next}.`);
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar disponibilidad', 'error');
    }
  }

  async function deleteMedia(mediaId: number, canonicalId: string) {
    try {
      const res = await apiFetch(`/api/admin/supports/${canonicalId}/media/${mediaId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || json.status !== 'success') throw new Error(json.message || 'No se pudo eliminar la media');
      await refreshSupportDetail(canonicalId);
      showToast('Media eliminada.');
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar media', 'error');
    }
  }

  async function saveMedia(canonicalId: string) {
    if (!editor) return;
    try {
      const draft = editor.mediaDraft;
      const payload = {
        media_type: draft.media_type,
        url: draft.url,
        title: draft.title,
        alt: draft.alt,
        mime_type: draft.mime_type,
        sort_order: Number(draft.sort_order || 0),
      };
      const url = draft.editingId ? `/api/admin/supports/${canonicalId}/media/${draft.editingId}` : `/api/admin/supports/${canonicalId}/media`;
      const method = draft.editingId ? 'PATCH' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json.status !== 'success') throw new Error(json.message || 'No se pudo guardar la media');
      await refreshSupportDetail(canonicalId);
      showToast(draft.editingId ? 'Media actualizada.' : 'Media creada.');
    } catch (err: any) {
      showToast(err.message || 'Error al guardar media', 'error');
    }
  }

  function startEditMedia(media: SupportMediaItem) {
    if (!editor) return;
    setEditor({
      ...editor,
      mediaDraft: {
        editingId: media.id,
        media_type: media.media_type,
        url: media.url,
        title: media.title || '',
        alt: media.alt || '',
        mime_type: media.mime_type || '',
        sort_order: String(media.sort_order ?? 0),
      },
    });
  }

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-7xl">
        {toastMessage && (
          <div className={`fixed top-20 right-6 z-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 ${toastTone === 'ok' ? 'bg-gray-900' : 'bg-red-600'}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-eyebrow text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
              Inventario
            </span>
            <h1 className="mt-2 text-page-title text-gray-900">Gestión de Soportes</h1>
            <p className="mt-1 text-sm text-gray-500">
              Administración de inventario, pricing interno, media y recorridos del LED móvil.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openEditor('create')}
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

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, código o calle..."
                className="pl-10"
              />
            </div>

            <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
              {[
                ['todas', 'Todas'],
                ['mendoza', 'Mendoza'],
                ['buenos-aires', 'Buenos Aires'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPlaza(value as typeof plaza)}
                  className={`rounded-md px-3 py-2 text-xs font-bold transition ${plaza === value
                    ? 'bg-gray-900 text-white shadow-2xs'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <select value={tipo} onChange={(e) => setTipo(e.target.value as typeof tipo)} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700">
              <option value="todos">Todos los formatos</option>
              <option value="tradicional">Tradicional</option>
              <option value="led">LED</option>
              <option value="led_movil">LED móvil</option>
            </select>

            <select value={availability} onChange={(e) => setAvailability(e.target.value as typeof availability)} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700">
              <option value="todos">Todas las disponibilidades</option>
              <option value="disponible">Disponibles</option>
              <option value="reservado">Reservados</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">{items.length}</span>
              <span>soportes encontrados</span>
              {(query || plaza !== 'todas' || tipo !== 'todos' || availability !== 'todos' || activeFilter !== 'todos') && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setPlaza('todas');
                    setTipo('todos');
                    setAvailability('todos');
                    setActiveFilter('todos');
                  }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500">Estado</span>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700"
              >
                <option value="todos">Todos</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </select>
              <button
                type="button"
                onClick={() => setRefreshKey((v) => v + 1)}
                className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-700 inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refrescar
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-9 rounded-lg border border-gray-200 bg-white px-2 font-semibold text-gray-700"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>por página</span>
            <span className="font-semibold text-gray-900">
              {items.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, items.length)} de {items.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="px-2 font-bold text-gray-700">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-3.5 px-4">Soporte / Código</th>
                  <th className="py-3.5 px-4">Plaza / Tipo</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedItems.map((item: any) => {
                  const isActive = item.active !== false;
                  const disp = item.disponibilidad || 'disponible';
                  return (
                    <tr key={item.canonical_id} className={!isActive ? 'bg-gray-50/60' : 'hover:bg-gray-50/80'}>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                        <div className="font-mono text-[11px] text-gray-400">{item.canonical_id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-700">{item.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'}</div>
                        <div className="text-[11px] text-gray-500 capitalize">{item.tipo_soporte?.replace('_', ' ')}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => toggleAvailability(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${disp === 'disponible' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${disp === 'disponible' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                          {disp === 'disponible' ? 'Disponible' : 'Reservado'}
                        </button>
                        {!isActive && (
                          <div className="mt-1 text-[10px] font-semibold text-gray-400">
                            Archivado
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditor('edit', item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateSupport(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                          >
                            Duplicar
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleActive(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-red-700 hover:border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Archivar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400">
                      No se encontraron soportes con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {editor && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start md:items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gray-50 rounded-3xl max-w-6xl w-full p-5 sm:p-6 shadow-2xl border border-gray-100 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-gray-400">
                    {editorMode === 'create' ? 'Nuevo soporte' : editor.canonical_id || 'Soporte'}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    {editorMode === 'create' ? 'Crear soporte' : editor.name || 'Editar soporte'}
                  </h2>
                </div>
                <button onClick={() => setEditor(null)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingEditor ? (
                <div className="py-20 text-center text-gray-500">Cargando soporte...</div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="space-y-5">
                    <Section title="Datos comerciales">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <Label htmlFor="name">Nombre</Label>
                          <Input id="name" value={editor.name} onChange={(e) => setEditor({ ...editor, name: e.target.value })} />
                        </div>
                        <div>
                          <Label>Ciudad</Label>
                          <select className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm" value={editor.ciudad} onChange={(e) => setEditor({ ...editor, ciudad: e.target.value as Plaza })}>
                            <option value="mendoza">Mendoza</option>
                            <option value="buenos-aires">Buenos Aires</option>
                          </select>
                        </div>
                        <div>
                          <Label>Familia</Label>
                          <select className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm" value={editor.family} onChange={(e) => setEditor({ ...editor, family: e.target.value as SupportFamily, tipo_soporte: familyToTipo(e.target.value as SupportFamily) })}>
                            <option value="traditional">traditional</option>
                            <option value="medium_format">medium_format</option>
                            <option value="led">led</option>
                            <option value="led_mobile">led_mobile</option>
                          </select>
                        </div>
                        <div>
                          <Label>Disponibilidad</Label>
                          <select className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm" value={editor.disponibilidad} onChange={(e) => setEditor({ ...editor, disponibilidad: e.target.value as Disponibilidad })}>
                            <option value="disponible">disponible</option>
                            <option value="reservado">reservado</option>
                          </select>
                        </div>
                        <div>
                          <Label>Activo</Label>
                          <select className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm" value={editor.active ? 'true' : 'false'} onChange={(e) => setEditor({ ...editor, active: e.target.value === 'true' })}>
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                          </select>
                        </div>
                        <div>
                          <Label>Destacado</Label>
                          <select className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm" value={editor.isFeatured ? 'true' : 'false'} onChange={(e) => setEditor({ ...editor, isFeatured: e.target.value === 'true' })}>
                            <option value="false">No</option>
                            <option value="true">Sí</option>
                          </select>
                        </div>
                        <div>
                          <Label>Liberación</Label>
                          <Input value={editor.availableFrom} onChange={(e) => setEditor({ ...editor, availableFrom: e.target.value })} placeholder="15 OCT 2026" />
                        </div>
                        <div>
                          <Label>Mapa URL</Label>
                          <Input value={editor.mapa_url} onChange={(e) => setEditor({ ...editor, mapa_url: e.target.value })} />
                        </div>
                        <div>
                          <Label>Latitud</Label>
                          <Input value={editor.lat} onChange={(e) => setEditor({ ...editor, lat: e.target.value })} />
                        </div>
                        <div>
                          <Label>Longitud</Label>
                          <Input value={editor.lng} onChange={(e) => setEditor({ ...editor, lng: e.target.value })} />
                        </div>
                        <div className="sm:col-span-2">
                          <Label>Dirección</Label>
                          <Input value={editor.address} onChange={(e) => setEditor({ ...editor, address: e.target.value })} />
                        </div>
                        <div className="sm:col-span-2">
                          <Label>Descripción</Label>
                          <Textarea rows={4} value={editor.description} onChange={(e) => setEditor({ ...editor, description: e.target.value })} />
                        </div>
                        <div className="sm:col-span-2">
                          <Label>Características</Label>
                          <Textarea rows={3} value={editor.characteristics} onChange={(e) => setEditor({ ...editor, characteristics: e.target.value })} />
                        </div>
                        <div className="sm:col-span-2">
                          <Label>Image URLs, una por línea</Label>
                          <Textarea rows={3} value={editor.imageUrlsText} onChange={(e) => setEditor({ ...editor, imageUrlsText: e.target.value })} />
                        </div>
                      </div>
                    </Section>

                    <Section title="Media">
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <Label>Tipo</Label>
                            <select className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm" value={editor.mediaDraft.media_type} onChange={(e) => setEditor({ ...editor, mediaDraft: { ...editor.mediaDraft, media_type: e.target.value as SupportMediaType } })}>
                              <option value="image">image</option>
                              <option value="video">video</option>
                              <option value="document">document</option>
                            </select>
                          </div>
                          <div>
                            <Label>Orden</Label>
                            <Input value={editor.mediaDraft.sort_order} onChange={(e) => setEditor({ ...editor, mediaDraft: { ...editor.mediaDraft, sort_order: e.target.value } })} />
                          </div>
                          <div className="sm:col-span-2">
                            <Label>URL</Label>
                            <Input value={editor.mediaDraft.url} onChange={(e) => setEditor({ ...editor, mediaDraft: { ...editor.mediaDraft, url: e.target.value } })} />
                          </div>
                          <div className="sm:col-span-2">
                            <Label>Título</Label>
                            <Input value={editor.mediaDraft.title} onChange={(e) => setEditor({ ...editor, mediaDraft: { ...editor.mediaDraft, title: e.target.value } })} />
                          </div>
                          <div className="sm:col-span-2">
                            <Label>Alt</Label>
                            <Input value={editor.mediaDraft.alt} onChange={(e) => setEditor({ ...editor, mediaDraft: { ...editor.mediaDraft, alt: e.target.value } })} />
                          </div>
                          <div className="sm:col-span-2">
                            <Label>MIME type</Label>
                            <Input value={editor.mediaDraft.mime_type} onChange={(e) => setEditor({ ...editor, mediaDraft: { ...editor.mediaDraft, mime_type: e.target.value } })} />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => editor.canonical_id && saveMedia(editor.canonical_id)}>
                            {editor.mediaDraft.editingId ? 'Actualizar media' : 'Agregar media'}
                          </Button>
                          {editor.mediaDraft.editingId && (
                            <button
                              type="button"
                              className="text-xs font-bold text-gray-500 hover:text-gray-900"
                              onClick={() => setEditor({ ...editor, mediaDraft: { editingId: null, media_type: 'image', url: '', title: '', alt: '', mime_type: '', sort_order: '0' } })}
                            >
                              Cancelar edición
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {editor.media.map((media) => (
                            <div key={media.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-gray-900 truncate">{media.title || media.url}</div>
                                <div className="text-[11px] text-gray-500 truncate">{media.media_type} · {media.url}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => startEditMedia(media)} className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1">
                                  <Edit3 className="w-3.5 h-3.5" />
                                  Editar
                                </button>
                                <button type="button" onClick={() => editor.canonical_id && deleteMedia(media.id, editor.canonical_id)} className="text-xs font-bold text-red-600 hover:underline inline-flex items-center gap-1">
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Borrar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Section>
                  </div>

                  <div className="space-y-5">
                    <Section title="Tecnología">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <Label>Resumen técnico</Label>
                          <Textarea rows={3} value={editor.technical.summary} onChange={(e) => setEditor({ ...editor, technical: { ...editor.technical, summary: e.target.value } })} />
                        </div>
                        <div className="sm:col-span-2">
                          <Label>Medidas</Label>
                          <Input value={editor.technical.measures} onChange={(e) => setEditor({ ...editor, technical: { ...editor.technical, measures: e.target.value } })} />
                        </div>
                        {editor.family === 'led' && (
                          <>
                            <div className="sm:col-span-2">
                              <Label>Resolución</Label>
                              <Input value={editor.technical.resolution} onChange={(e) => setEditor({ ...editor, technical: { ...editor.technical, resolution: e.target.value } })} />
                            </div>
                            <div className="sm:col-span-2">
                              <Label>Horario de encendido</Label>
                              <Input value={editor.technical.turn_on_schedule} onChange={(e) => setEditor({ ...editor, technical: { ...editor.technical, turn_on_schedule: e.target.value } })} />
                            </div>
                            <div>
                              <Label>Frecuencia diaria</Label>
                              <Input value={editor.technical.daily_frequency} onChange={(e) => setEditor({ ...editor, technical: { ...editor.technical, daily_frequency: e.target.value } })} />
                            </div>
                            <div>
                              <Label>Requisitos técnicos</Label>
                              <Input value={editor.technical.requirements} onChange={(e) => setEditor({ ...editor, technical: { ...editor.technical, requirements: e.target.value } })} />
                            </div>
                          </>
                        )}
                        {editor.family === 'led_mobile' && (
                          <>
                            <div>
                              <Label>Spot segundos</Label>
                              <Input value={editor.technical.spot_duration_seconds} onChange={(e) => setEditor({ ...editor, technical: { ...editor.technical, spot_duration_seconds: e.target.value } })} />
                            </div>
                            <div>
                              <Label>Salidas diarias mín.</Label>
                              <Input value={editor.technical.minimum_daily_outings} onChange={(e) => setEditor({ ...editor, technical: { ...editor.technical, minimum_daily_outings: e.target.value } })} />
                            </div>
                            <div>
                              <Label>Máx. anunciantes</Label>
                              <Input value={editor.technical.max_advertisers} onChange={(e) => setEditor({ ...editor, technical: { ...editor.technical, max_advertisers: e.target.value } })} />
                            </div>
                            <div>
                              <Label>Duración recorrido hs</Label>
                              <Input value={editor.technical.route_duration_hours} onChange={(e) => setEditor({ ...editor, technical: { ...editor.technical, route_duration_hours: e.target.value } })} />
                            </div>
                            <div className="sm:col-span-2">
                              <Label>Días de operación</Label>
                              <Input value={editor.technical.operation_days} onChange={(e) => setEditor({ ...editor, technical: { ...editor.technical, operation_days: e.target.value } })} />
                            </div>
                            <div className="sm:col-span-2">
                              <Label>Modo de video</Label>
                              <Input value={editor.technical.video_mode} onChange={(e) => setEditor({ ...editor, technical: { ...editor.technical, video_mode: e.target.value } })} />
                            </div>
                            <div className="sm:col-span-2">
                              <Label>Requisitos</Label>
                              <Textarea rows={3} value={editor.technical.requirements} onChange={(e) => setEditor({ ...editor, technical: { ...editor.technical, requirements: e.target.value } })} />
                            </div>
                          </>
                        )}
                      </div>
                    </Section>

                    <Section title="Pricing interno">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label>Exhibition</Label><Input value={editor.pricing.exhibition_price} onChange={(e) => setEditor({ ...editor, pricing: { ...editor.pricing, exhibition_price: e.target.value } })} /></div>
                        <div><Label>Installation</Label><Input value={editor.pricing.installation_price} onChange={(e) => setEditor({ ...editor, pricing: { ...editor.pricing, installation_price: e.target.value } })} /></div>
                        <div><Label>Printing</Label><Input value={editor.pricing.printing_price} onChange={(e) => setEditor({ ...editor, pricing: { ...editor.pricing, printing_price: e.target.value } })} /></div>
                        <div><Label>Monthly</Label><Input value={editor.pricing.monthly_price} onChange={(e) => setEditor({ ...editor, pricing: { ...editor.pricing, monthly_price: e.target.value } })} /></div>
                        <div><Label>Exclusive</Label><Input value={editor.pricing.exclusive_price} onChange={(e) => setEditor({ ...editor, pricing: { ...editor.pricing, exclusive_price: e.target.value } })} /></div>
                        <div>
                          <Label>Currency</Label>
                          <select className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm" value={editor.pricing.currency} onChange={(e) => setEditor({ ...editor, pricing: { ...editor.pricing, currency: e.target.value as 'ARS' | 'USD' } })}>
                            <option value="ARS">ARS</option>
                            <option value="USD">USD</option>
                          </select>
                        </div>
                        <div>
                          <Label>Tax included</Label>
                          <select className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm" value={editor.pricing.tax_included ? 'true' : 'false'} onChange={(e) => setEditor({ ...editor, pricing: { ...editor.pricing, tax_included: e.target.value === 'true' } })}>
                            <option value="false">No</option>
                            <option value="true">Sí</option>
                          </select>
                        </div>
                        <div>
                          <Label>Public price</Label>
                          <select className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm" value={editor.pricing.price_public ? 'true' : 'false'} onChange={(e) => setEditor({ ...editor, pricing: { ...editor.pricing, price_public: e.target.value === 'true' } })}>
                            <option value="false">No</option>
                            <option value="true">Sí</option>
                          </select>
                        </div>
                      </div>
                    </Section>

                    {editor.family === 'led_mobile' && (
                      <Section title="Ruta LED móvil">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <Label>Nombre de recorrido</Label>
                            <Input value={editor.route.route_name} onChange={(e) => setEditor({ ...editor, route: { ...editor.route, route_name: e.target.value } })} />
                          </div>
                          <div>
                            <Label>Modo de ruta</Label>
                            <Input value={editor.route.route_mode} onChange={(e) => setEditor({ ...editor, route: { ...editor.route, route_mode: e.target.value } })} />
                          </div>
                          <div>
                            <Label>Horario</Label>
                            <Input value={editor.route.schedule} onChange={(e) => setEditor({ ...editor, route: { ...editor.route, schedule: e.target.value } })} />
                          </div>
                          <div>
                            <Label>Duración</Label>
                            <Input value={editor.route.duration} onChange={(e) => setEditor({ ...editor, route: { ...editor.route, duration: e.target.value } })} />
                          </div>
                          <div>
                            <Label>Horas</Label>
                            <Input value={editor.route.hours} onChange={(e) => setEditor({ ...editor, route: { ...editor.route, hours: e.target.value } })} />
                          </div>
                          <div className="sm:col-span-2">
                            <Label>Días</Label>
                            <Input value={editor.route.weekdays} onChange={(e) => setEditor({ ...editor, route: { ...editor.route, weekdays: e.target.value } })} />
                          </div>
                          <div>
                            <Label>Default route</Label>
                            <select className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm" value={editor.route.default_route ? 'true' : 'false'} onChange={(e) => setEditor({ ...editor, route: { ...editor.route, default_route: e.target.value === 'true' } })}>
                              <option value="true">Sí</option>
                              <option value="false">No</option>
                            </select>
                          </div>
                          <div>
                            <Label>Máx. anunciantes</Label>
                            <Input value={editor.route.max_advertisers} onChange={(e) => setEditor({ ...editor, route: { ...editor.route, max_advertisers: e.target.value } })} />
                          </div>
                          <div>
                            <Label>Spot seg</Label>
                            <Input value={editor.route.spot_duration_seconds} onChange={(e) => setEditor({ ...editor, route: { ...editor.route, spot_duration_seconds: e.target.value } })} />
                          </div>
                          <div>
                            <Label>Salidas mín.</Label>
                            <Input value={editor.route.minimum_daily_outings} onChange={(e) => setEditor({ ...editor, route: { ...editor.route, minimum_daily_outings: e.target.value } })} />
                          </div>
                          <div className="sm:col-span-2">
                            <Label>Waypoints JSON</Label>
                            <Textarea rows={5} value={editor.route.waypointsText} onChange={(e) => setEditor({ ...editor, route: { ...editor.route, waypointsText: e.target.value } })} />
                          </div>
                          <div className="sm:col-span-2">
                            <Label>RoutePath JSON</Label>
                            <Textarea rows={5} value={editor.route.routePathText} onChange={(e) => setEditor({ ...editor, route: { ...editor.route, routePathText: e.target.value } })} />
                          </div>
                        </div>
                      </Section>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-1">
                      <Button type="button" variant="outline" onClick={() => setEditor(null)}>
                        Cancelar
                      </Button>
                      <Button type="button" onClick={submitSupport} disabled={saving}>
                        <Save className="w-4 h-4" />
                        {saving ? 'Guardando...' : editorMode === 'create' ? 'Crear soporte' : 'Guardar cambios'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
