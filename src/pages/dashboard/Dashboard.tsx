import { useState, useEffect } from 'react';
import {
  FileText,
  MonitorSmartphone,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { KPICard } from '../../components/dashboard/ui/KPICard';
import { StatusBadge } from '../../components/dashboard/ui/StatusBadge';
import { apiFetch } from '../../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    reserved: 0,
    inactive: 0,
    mendozaTotal: 0,
    mendozaAvailable: 0,
    buenosAiresTotal: 0,
    buenosAiresAvailable: 0,
    tradicionalCount: 0,
    ledCount: 0,
    movilCount: 0,
    totalRequests: 0,
    pendingRequests: 0,
  });
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/login');
      return;
    }

    async function fetchAdminData() {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, reqsRes] = await Promise.all([
          apiFetch('/api/admin/stats', { headers }),
          apiFetch('/api/admin/requests', { headers }),
        ]);

        if (statsRes.status === 401 || reqsRes.status === 401) {
          localStorage.removeItem('admin_token');
          navigate('/login');
          return;
        }

        const statsJson = await statsRes.json();
        const reqsJson = await reqsRes.json();

        if (statsJson.status === 'success') {
          setStats(statsJson.data);
        }
        if (reqsJson.status === 'success') {
          setRequests(reqsJson.data);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      }
    }

    fetchAdminData();
  }, [navigate]);

  const occupancyRate = stats.total > 0 ? Math.round((stats.reserved / stats.total) * 100) : 0;
  const availableRate = stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0;
  const recentRequests = requests.slice(0, 4);

  return (
    <DashboardShell>
      <div className="space-y-8 max-w-6xl mx-auto pb-10">
        {/* 1. Header Title & Context */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Centro de Operaciones
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950">
              Resumen Ejecutivo
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-2xl">
              Supervisión de inventario de vía pública, disponibilidad por plaza y solicitudes de Media Kit.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/dashboard/soportes"
              className="px-4 py-2.5 bg-gray-950 text-white hover:bg-gray-800 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2 active:scale-95 min-h-[40px]"
            >
              <MonitorSmartphone className="w-4 h-4 text-emerald-400" />
              <span>Ver Soportes</span>
            </Link>
            <Link
              to="/dashboard/mediakits"
              className="px-4 py-2.5 bg-white text-gray-800 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2 active:scale-95 min-h-[40px]"
            >
              <FileText className="w-4 h-4 text-gray-500" />
              <span>Ver Solicitudes</span>
            </Link>
          </div>
        </header>

        {/* 2. Top Metric Cards (FRENTE 1) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Soportes Totales */}
          <KPICard
            title="Inventario Total"
            value={stats.total}
            unit="soportes"
            icon={MonitorSmartphone}
            iconColorClass="text-gray-800"
            iconBgClass="bg-gray-100"
            statusBadge={
              <StatusBadge
                status="disponible"
                label={`${stats.available} Disp.`}
                size="sm"
                showIcon={false}
              />
            }
            footer={
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>
                  <strong className="text-gray-950 font-bold">{stats.available}</strong> disponibles ({availableRate}%)
                </span>
              </div>
            }
          />

          {/* Ocupación Comercial */}
          <KPICard
            title="Tasa de Ocupación"
            value={`${occupancyRate}%`}
            unit="en pauta"
            icon={TrendingUp}
            iconColorClass="text-amber-700"
            iconBgClass="bg-amber-50 border border-amber-100"
            statusBadge={
              <StatusBadge
                status="reservado"
                label="Comercial"
                size="sm"
                showIcon={false}
              />
            }
            footer={
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span>
                  <strong className="text-gray-950 font-bold">{stats.reserved}</strong> soportes reservados
                </span>
              </div>
            }
          />

          {/* Solicitudes de Media Kit */}
          <KPICard
            title="Solicitudes Media Kit"
            value={requests.length}
            unit="totales"
            icon={FileText}
            iconColorClass="text-emerald-700"
            iconBgClass="bg-emerald-50 border border-emerald-100"
            statusBadge={
              stats.pendingRequests > 0 ? (
                <StatusBadge
                  status="nuevo"
                  label={`${stats.pendingRequests} Nuevas`}
                  size="sm"
                />
              ) : (
                <StatusBadge
                  status="active"
                  label="Al día"
                  size="sm"
                  showIcon={false}
                />
              )
            }
            footer={
              <div className="flex items-center gap-1.5">
                {stats.pendingRequests > 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                    <span className="text-emerald-700 font-bold">
                      {stats.pendingRequests} nuevas por atender
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400">Al día con las respuestas</span>
                )}
              </div>
            }
          />

          {/* Cobertura de Plazas */}
          <KPICard
            title="Plazas Operativas"
            value="2"
            unit="Mendoza & Buenos Aires"
            icon={MapPin}
            iconColorClass="text-blue-700"
            iconBgClass="bg-blue-50 border border-blue-100"
            statusBadge={
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                Activas
              </span>
            }
            footer={
              <div className="text-xs text-gray-600 font-medium truncate">
                Mza: <strong className="text-gray-950 font-bold">{stats.mendozaTotal}</strong> · BUE:{' '}
                <strong className="text-gray-950 font-bold">{stats.buenosAiresTotal}</strong> soportes
              </div>
            }
          />
        </div>

        {/* 3. Middle Section: Plazas Breakdown + Quick Access */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Plazas Status Breakdown (2 cols) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-950">Disponibilidad por Plaza</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Balance de inventario disponible para comercialización inmediata.
                </p>
              </div>
              <Link
                to="/dashboard/soportes"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                <span>Gestionar</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Plaza Mendoza Card */}
              <div className="p-4 rounded-xl bg-gray-50/90 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm font-bold text-gray-950">Mendoza</span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 bg-white px-2 py-0.5 rounded-md border border-gray-200/80 shadow-2xs">
                    {stats.mendozaTotal} soportes
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-emerald-800 font-bold">
                      {stats.mendozaAvailable} Disponibles
                    </span>
                    <span className="text-gray-500 font-medium">
                      {stats.mendozaTotal - stats.mendozaAvailable} Reservados
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200/80 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{
                        width: `${(stats.mendozaAvailable / (stats.mendozaTotal || 1)) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-gray-300 h-full transition-all duration-500"
                      style={{
                        width: `${((stats.mendozaTotal - stats.mendozaAvailable) / (stats.mendozaTotal || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Plaza Buenos Aires Card */}
              <div className="p-4 rounded-xl bg-gray-50/90 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-sm font-bold text-gray-950">Buenos Aires</span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 bg-white px-2 py-0.5 rounded-md border border-gray-200/80 shadow-2xs">
                    {stats.buenosAiresTotal} soportes
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-emerald-800 font-bold">
                      {stats.buenosAiresAvailable} Disponibles
                    </span>
                    <span className="text-gray-500 font-medium">
                      {stats.buenosAiresTotal - stats.buenosAiresAvailable} Reservados
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200/80 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{
                        width: `${(stats.buenosAiresAvailable / (stats.buenosAiresTotal || 1)) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-gray-300 h-full transition-all duration-500"
                      style={{
                        width: `${((stats.buenosAiresTotal - stats.buenosAiresAvailable) / (stats.buenosAiresTotal || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Support Formats distribution pills */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-500 font-bold text-[11px] uppercase tracking-wider">Formatos:</span>
              <span className="bg-gray-100 text-gray-800 font-semibold px-2.5 py-1 rounded-lg border border-gray-200/70">
                Tradicionales: <strong className="text-gray-950 font-bold">{stats.tradicionalCount}</strong>
              </span>
              <span className="bg-gray-100 text-gray-800 font-semibold px-2.5 py-1 rounded-lg border border-gray-200/70">
                Pantallas LED: <strong className="text-gray-950 font-bold">{stats.ledCount}</strong>
              </span>
              <span className="bg-gray-100 text-gray-800 font-semibold px-2.5 py-1 rounded-lg border border-gray-200/70">
                LED Móvil: <strong className="text-gray-950 font-bold">{stats.movilCount}</strong>
              </span>
            </div>
          </div>

          {/* Quick Access Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 mb-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Acciones Rápidas</span>
              </div>
              <h3 className="text-base font-bold text-gray-950">Operaciones Habituales</h3>
              <p className="text-xs text-gray-500 mt-1">
                Atajos directos para control de inventario y atención a anunciantes.
              </p>
            </div>

            <div className="space-y-2">
              <Link
                to="/dashboard/soportes"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/80 hover:bg-gray-100 text-xs font-bold text-gray-800 transition-colors active:scale-[0.98]"
              >
                <span>Controlar disponibilidad de soportes</span>
                <ArrowUpRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                to="/dashboard/mediakits"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/80 hover:bg-gray-100 text-xs font-bold text-gray-800 transition-colors active:scale-[0.98]"
              >
                <span>Revisar solicitudes de clientes</span>
                <ArrowUpRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                to="/inventario"
                className="flex items-center justify-between p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/60 hover:bg-emerald-100/60 text-xs font-bold text-emerald-900 transition-colors active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Abrir mapa público en vivo</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-700" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4. Bottom Section: Recent Media Kit Requests (FRENTE 3) */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 sm:px-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-950">Últimas Solicitudes de Media Kit</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Contactos recibidos a través del explorador de inventario.
              </p>
            </div>
            <Link
              to="/dashboard/mediakits"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
            >
              <span>Ver todas ({requests.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {recentRequests.map((req: any) => (
              <div
                key={req.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {req.requestId}
                    </span>
                    <span className="font-bold text-sm text-gray-950">{req.requesterName}</span>
                    {req.requesterCompany && (
                      <span className="text-xs text-gray-500 font-medium">({req.requesterCompany})</span>
                    )}
                    <StatusBadge status={req.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Solicitud de cotización de soportes</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-[11px] font-medium text-gray-400">
                    {req.createdAt
                      ? new Date(req.createdAt).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </span>
                  <Link
                    to="/dashboard/mediakits"
                    className="px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-xs font-bold text-gray-800 transition-colors shadow-2xs min-h-[36px] flex items-center justify-center active:scale-95"
                  >
                    Detalle
                  </Link>
                </div>
              </div>
            ))}

            {requests.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-500 font-medium">
                No hay solicitudes registradas todavía.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
