import { useState, useEffect } from 'react';
import {
  FileText,
  MonitorSmartphone,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { Badge } from '../../components/ui/Badge';
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
  const recentRequests = requests.slice(0, 4);

  return (
    <DashboardShell>
      <div className="space-y-8 max-w-6xl">
        {/* Header Title & Context */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-eyebrow text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                Centro de Operaciones
              </span>
            </div>
            <h1 className="mt-2 text-page-title text-gray-900">
              Resumen Ejecutivo
            </h1>
            <p className="mt-1 text-sm text-gray-500 max-w-2xl">
              Supervisión de inventario de vía pública, disponibilidad por plaza y solicitudes de Media Kit.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/dashboard/soportes"
              className="px-4 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
            >
              <MonitorSmartphone className="w-3.5 h-3.5" />
              <span>Ver Soportes</span>
            </Link>
            <Link
              to="/dashboard/mediakits"
              className="px-4 py-2.5 bg-white text-gray-700 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ver Solicitudes</span>
            </Link>
          </div>
        </header>

        {/* Top Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Soportes Totales */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow text-gray-400">
                Inventario Total
              </span>
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                <MonitorSmartphone className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{stats.total}</span>
              <span className="text-xs text-gray-500 font-medium">soportes</span>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>
                <strong className="text-gray-900 font-semibold">{stats.available}</strong> disponibles (
                {stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}%)
              </span>
            </div>
          </div>

          {/* Ocupación Comercial */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow text-gray-400">
                Tasa de Ocupación
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{occupancyRate}%</span>
              <span className="text-xs text-gray-500 font-medium">en pauta</span>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>
                <strong className="text-gray-900 font-semibold">{stats.reserved}</strong> soportes reservados
              </span>
            </div>
          </div>

          {/* Solicitudes de Media Kit */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow text-gray-400">
                Solicitudes Media Kit
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{stats.totalRequests}</span>
              <span className="text-xs text-gray-500 font-medium">totales</span>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
              {stats.pendingRequests > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span className="text-emerald-700 font-bold">{stats.pendingRequests} nuevas por atender</span>
                </>
              ) : (
                <span className="text-gray-400">Al día con las respuestas</span>
              )}
            </div>
          </div>

          {/* Cobertura de Plazas */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow text-gray-400">
                Plazas Operativas
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">2</span>
              <span className="text-xs text-gray-500 font-medium">Mendoza & Buenos Aires</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <span>Mza: {stats.mendozaTotal} · BUE: {stats.buenosAiresTotal} soportes</span>
            </div>
          </div>
        </div>

        {/* Middle Section: Plazas Breakdown + Formatos */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Plazas Status Breakdown (2 cols) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-card-title text-gray-900">Disponibilidad por Plaza</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Balance de inventario disponible para comercialización inmediata.
                </p>
              </div>
              <Link
                to="/dashboard/soportes"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Gestionar</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Plaza Mendoza Card */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-sm font-bold text-gray-900">Mendoza</span>
                  </div>
                  <span className="text-xs font-bold text-gray-600 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                    {stats.mendozaTotal} soportes
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-emerald-700 font-semibold">
                      {stats.mendozaAvailable} Disponibles
                    </span>
                    <span className="text-gray-400">
                      {stats.mendozaTotal - stats.mendozaAvailable} Reservados
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{
                        width: `${(stats.mendozaAvailable / (stats.mendozaTotal || 1)) * 100}%`,
                      }}
                    ></div>
                    <div
                      className="bg-gray-300 h-full transition-all duration-500"
                      style={{
                        width: `${((stats.mendozaTotal - stats.mendozaAvailable) / (stats.mendozaTotal || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Plaza Buenos Aires Card */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-sm font-bold text-gray-900">Buenos Aires</span>
                  </div>
                  <span className="text-xs font-bold text-gray-600 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                    {stats.buenosAiresTotal} soportes
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-emerald-700 font-semibold">
                      {stats.buenosAiresAvailable} Disponibles
                    </span>
                    <span className="text-gray-400">
                      {stats.buenosAiresTotal - stats.buenosAiresAvailable} Reservados
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{
                        width: `${(stats.buenosAiresAvailable / (stats.buenosAiresTotal || 1)) * 100}%`,
                      }}
                    ></div>
                    <div
                      className="bg-gray-300 h-full transition-all duration-500"
                      style={{
                        width: `${((stats.buenosAiresTotal - stats.buenosAiresAvailable) / (stats.buenosAiresTotal || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Formats pills */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-400 font-medium">Distribución por Formato:</span>
              <span className="bg-gray-100 text-gray-800 font-semibold px-2.5 py-1 rounded-lg">
                Tradicionales: {stats.tradicionalCount}
              </span>
              <span className="bg-gray-100 text-gray-800 font-semibold px-2.5 py-1 rounded-lg">
                Pantallas LED: {stats.ledCount}
              </span>
              <span className="bg-gray-100 text-gray-800 font-semibold px-2.5 py-1 rounded-lg">
                LED Móvil: {stats.movilCount}
              </span>
            </div>
          </div>

          {/* Quick Access Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-eyebrow">Acciones Rápidas</span>
              </div>
              <h3 className="text-card-title text-gray-900">Operaciones Habituales</h3>
              <p className="text-xs text-gray-500 mt-1">
                Atajos directos para control de inventario y atención a anunciantes.
              </p>
            </div>

            <div className="space-y-2">
              <Link
                to="/dashboard/soportes"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-800 transition-colors"
              >
                <span>Controlar disponibilidad de soportes</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>
              <Link
                to="/dashboard/mediakits"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-800 transition-colors"
              >
                <span>Revisar solicitudes de Media Kit</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-card-title text-gray-900">Solicitudes Recientes</h2>
              <p className="text-xs text-gray-500 mt-0.5">Últimas solicitudes de Media Kit recibidas.</p>
            </div>
            <Link
              to="/dashboard/mediakits"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">No hay solicitudes recientes.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentRequests.map((request) => (
                <div key={request.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-900 truncate">{request.requesterName}</span>
                      {request.status && <Badge variant="status" status={request.status} />}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{request.requesterCompany || 'Particular'}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-gray-400">
                    {new Date(request.createdAt).toLocaleDateString('es-AR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
