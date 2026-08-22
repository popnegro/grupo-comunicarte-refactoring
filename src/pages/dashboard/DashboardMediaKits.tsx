import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Building,
  CheckCircle2,
  Send,
  Eye,
  Download,
  ExternalLink,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import {
  getStoredLeads,
  updateLeadStatus,
  subscribeToLeads,
  DashboardLead,
} from '../../lib/dashboard-store';

export default function DashboardMediaKits() {
  const [leads, setLeads] = useState<DashboardLead[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedLead, setSelectedLead] = useState<DashboardLead | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    setLeads(getStoredLeads());
    const unsubscribe = subscribeToLeads((updatedLeads) => {
      setLeads(updatedLeads);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedLead(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleStatusChange = (leadId: string, nextStatus: DashboardLead['status']) => {
    const updated = updateLeadStatus(leadId, nextStatus);
    setLeads(updated);
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
    showToast(`Estado actualizado a "${getStatusLabel(nextStatus)}"`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const filteredLeads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchQuery =
        !q ||
        lead.clientName.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.requestId.toLowerCase().includes(q) ||
        lead.supportNames.some((s) => s.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'todos' || lead.status === statusFilter;

      return matchQuery && matchStatus;
    });
  }, [leads, query, statusFilter]);

  const counts = useMemo(() => {
    return {
      total: leads.length,
      nuevo: leads.filter((l) => l.status === 'nuevo').length,
      contactado: leads.filter((l) => l.status === 'contactado').length,
      enviado: leads.filter((l) => l.status === 'enviado').length,
      cerrado: leads.filter((l) => l.status === 'cerrado').length,
    };
  }, [leads]);

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
                Gestión Comercial
              </span>
            </div>
            <h1 className="mt-2 text-page-title text-gray-900">
              Media Kits & Solicitudes
            </h1>
            <p className="mt-1 text-sm text-gray-500 max-w-2xl">
              Bandeja de solicitudes de anunciantes recibidas desde el mapa y generador de cotizaciones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                showToast('Exportación de leads en CSV simulada correctamente');
              }}
              className="px-3.5 py-2 bg-white text-gray-700 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Reporte</span>
            </button>
          </div>
        </header>

        {/* Status Count Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              statusFilter === 'todos'
                ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
              Todas
            </span>
            <span className="text-xl font-extrabold mt-1 block">{counts.total}</span>
          </button>

          <button
            onClick={() => setStatusFilter('nuevo')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              statusFilter === 'nuevo'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                Nuevas
              </span>
              {counts.nuevo > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <span className="text-xl font-extrabold mt-1 block">{counts.nuevo}</span>
          </button>

          <button
            onClick={() => setStatusFilter('contactado')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              statusFilter === 'contactado'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:border-amber-200'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
              Contactados
            </span>
            <span className="text-xl font-extrabold mt-1 block">{counts.contactado}</span>
          </button>

          <button
            onClick={() => setStatusFilter('enviado')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              statusFilter === 'enviado'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-200'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
              Kit Enviado
            </span>
            <span className="text-xl font-extrabold mt-1 block">{counts.enviado}</span>
          </button>

          <button
            onClick={() => setStatusFilter('cerrado')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              statusFilter === 'cerrado'
                ? 'bg-gray-700 text-white border-gray-700 shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
              Cerrados
            </span>
            <span className="text-xl font-extrabold mt-1 block">{counts.cerrado}</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por cliente, empresa, soporte o ID de solicitud..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 text-xs font-medium outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs font-semibold text-gray-700 outline-none focus:border-emerald-600 focus:bg-white"
              >
                <option value="todos">Todos los Estados</option>
                <option value="nuevo">Nuevas</option>
                <option value="contactado">Contactados</option>
                <option value="enviado">Kit Enviado</option>
                <option value="cerrado">Cerrados</option>
              </select>

              {(query || statusFilter !== 'todos') && (
                <button
                  onClick={() => {
                    setQuery('');
                    setStatusFilter('todos');
                  }}
                  className="h-10 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-3.5 px-4">Solicitud / Contacto</th>
                  <th className="py-3.5 px-4">Empresa / Datos</th>
                  <th className="py-3.5 px-4">Soportes Requeridos</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Solicitud & Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[11px] font-bold text-gray-400">
                        {lead.requestId}
                      </div>
                      <div className="font-bold text-sm text-gray-900">{lead.clientName}</div>
                    </td>

                    {/* Company & Contact */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                        <Building className="w-3 h-3 text-gray-400" />
                        {lead.company || 'Particular / Directo'}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{lead.email}</div>
                    </td>

                    {/* Soportes */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap items-center gap-1">
                        {lead.supportNames.slice(0, 2).map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[140px]"
                          >
                            {s}
                          </span>
                        ))}
                        {lead.supportNames.length > 2 && (
                          <span className="text-[10px] font-bold text-gray-400">
                            +{lead.supportNames.length - 2} más
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="py-3.5 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Estado Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          handleStatusChange(lead.id, e.target.value as DashboardLead['status'])
                        }
                        className={`text-xs font-bold py-1 px-2.5 rounded-lg border outline-none cursor-pointer ${
                          lead.status === 'nuevo'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : lead.status === 'contactado'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : lead.status === 'enviado'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        <option value="nuevo">Nuevo</option>
                        <option value="contactado">Contactado</option>
                        <option value="enviado">Kit Enviado</option>
                        <option value="cerrado">Cerrado</option>
                      </select>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-xs font-bold text-gray-800 transition-colors shadow-2xs inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                        <span>Detalle</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      No se encontraron solicitudes con los criterios de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead Detail Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-gray-400 block">
                    {selectedLead.requestId}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 mt-0.5">
                    Solicitud de {selectedLead.clientName}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Recibida el{' '}
                    {new Date(selectedLead.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Client & Company Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-gray-400 font-bold uppercase text-[9px] block">Empresa</span>
                  <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                    {selectedLead.company || 'Particular'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-gray-400 font-bold uppercase text-[9px] block">Email</span>
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="font-bold text-emerald-700 hover:underline text-xs mt-0.5 block truncate"
                  >
                    {selectedLead.email}
                  </a>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-gray-400 font-bold uppercase text-[9px] block">Teléfono</span>
                  <span className="font-bold text-gray-900 text-xs mt-0.5 block">
                    {selectedLead.phone || 'No especificado'}
                  </span>
                </div>
              </div>

              {/* Message from client */}
              {selectedLead.message && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Mensaje / Consulta del Cliente
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    "{selectedLead.message}"
                  </p>
                </div>
              )}

              {/* Requested Supports List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900">
                    Soportes incluidos ({selectedLead.supportNames.length})
                  </span>
                  {selectedLead.estimatedBudget && (
                    <span className="text-emerald-700 font-bold">
                      Presupuesto estimado: {selectedLead.estimatedBudget}
                    </span>
                  )}
                </div>

                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden text-xs">
                  {selectedLead.supportNames.map((name, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-gray-900">{name}</span>
                      </div>
                      <Link
                        to={`/inventario?soporte=${encodeURIComponent(selectedLead.supportIds[idx] || '')}`}
                        className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                      >
                        <span>Ver en mapa</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Control inside modal */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-emerald-900 font-bold text-xs block">
                    Gestión del Lead
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Cambia el estado conforme avances con la propuesta comercial.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedLead.id, 'contactado')}
                    className="px-3 py-1.5 bg-white border border-amber-200 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-50 shadow-2xs"
                  >
                    Marcar Contactado
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedLead.id, 'enviado')}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-2xs flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>Marcar Kit Enviado</span>
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    showToast('Media Kit en PDF descargado exitosamente');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Generar Ficha PDF</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function getStatusLabel(status: DashboardLead['status']): string {
  switch (status) {
    case 'nuevo':
      return 'Nuevo';
    case 'contactado':
      return 'Contactado';
    case 'enviado':
      return 'Kit Enviado';
    case 'cerrado':
      return 'Cerrado';
  }
}
