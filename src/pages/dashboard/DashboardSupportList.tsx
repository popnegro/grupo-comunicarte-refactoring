import { useEffect, useState } from 'react';
import { CalendarDays, Copy, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ActionMenuItem } from '../../components/dashboard/ui/ActionMenu';
import { apiFetch } from '../../lib/api';
import {
  useSupportListFilters,
  type SupportListItem,
} from '../../hooks/useSupportListFilters';
import { SupportListView } from './SupportListView';

type Support = SupportListItem;

export default function DashboardSupportList() {
  const navigate = useNavigate();
  const [supports, setSupports] = useState<Support[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const filters = useSupportListFilters(supports);

  const [supportForReservation, setSupportForReservation] = useState<Support | null>(null);
  const [supportToArchive, setSupportToArchive] = useState<Support | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3000);
  };

  const load = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/supports', {
        
      });
      
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
    setIsArchiving(true);
    try {
      const res = await apiFetch(`/api/admin/supports/${encodeURIComponent(supportToArchive.canonical_id)}`, {
        method: 'DELETE',
        
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
    try {
      const detailRes = await apiFetch(`/api/admin/supports/${encodeURIComponent(item.canonical_id)}`, {
        
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
        headers: { 'Content-Type': 'application/json' },
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
    <SupportListView
      supports={supports}
      visible={filters.visible}
      loading={loading}
      message={message}
      query={filters.query}
      setQuery={filters.setQuery}
      plaza={filters.plaza}
      setPlaza={filters.setPlaza}
      type={filters.type}
      setType={filters.setType}
      availability={filters.availability}
      setAvailability={filters.setAvailability}
      active={filters.active}
      setActive={filters.setActive}
      sortField={filters.sortField}
      sortOrder={filters.sortOrder}
      handleSort={filters.handleSort}
      hasActiveFilters={filters.hasActiveFilters}
      clearFilters={filters.clearFilters}
      load={load}
      navigate={navigate}
      getActionMenuItems={getActionMenuItems}
      supportForReservation={supportForReservation}
      setSupportForReservation={setSupportForReservation}
      supportToArchive={supportToArchive}
      setSupportToArchive={setSupportToArchive}
      isArchiving={isArchiving}
      handleConfirmArchive={handleConfirmArchive}
    />
  );
}
