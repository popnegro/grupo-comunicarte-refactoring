import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Megaphone,
  Layers,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Mail,
  History,
  CheckCircle2,
  Plus,
  Trash2,
  AlertTriangle,
  HelpCircle,
  Save,
  Clock,
  Ruler,
} from 'lucide-react';
import {
  MediaKitRequestItem,
  MediaKitPropuestaSupport,
  PropuestaDuracionUnidad,
  PropuestaMoneda,
  MediaKitStatus,
} from '../../types/mediaKits';
import { SupportItem } from '../../types/inventory';
import { StatusBadge } from '../ui/StatusBadge';
import { TypeIcon } from '../ui/TypeIcon';
import { IntegrationNotice } from '../shared/StateNotice';
import { INITIAL_INVENTORY_FIXTURES } from '../../fixtures/inventoryFixtures';

interface MediaKitsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  request: MediaKitRequestItem | null;
  onSavePresentational?: (updated: MediaKitRequestItem) => void;
  onStatusChangePresentational?: (id: string, newStatus: MediaKitStatus) => void;
  availableSupports?: SupportItem[];
}

export const MediaKitsDrawer: React.FC<MediaKitsDrawerProps> = ({
  isOpen,
  onClose,
  request,
  onSavePresentational,
  onStatusChangePresentational,
  availableSupports = INITIAL_INVENTORY_FIXTURES,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'materiales' | 'historial'>('info');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Estado del formulario editable de la propuesta comercial
  const [formData, setFormData] = useState<Partial<MediaKitRequestItem>>({});
  const [selectedSupportToAdd, setSelectedSupportToAdd] = useState<string>('');
  const [dateValidationError, setDateValidationError] = useState<string | null>(null);
  const [amountValidationError, setAmountValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (request) {
      setFormData({
        ...request,
        soportes: request.soportes ? [...request.soportes] : [],
        periodo: request.periodo ? { ...request.periodo } : { duracionUnidad: 'días' },
        monto: request.monto ? { ...request.monto } : { moneda: 'ARS' },
      });
      setSelectedSupportToAdd('');
      setDateValidationError(null);
      setAmountValidationError(null);
      setActionFeedback(null);
    }
  }, [request]);

  if (!isOpen || !request) return null;

  // Validación de fechas de período contratado
  const validateDates = (inicio?: string, fin?: string) => {
    if (inicio && fin && inicio > fin) {
      setDateValidationError('La fecha de finalización no puede ser anterior a la de inicio.');
      return false;
    }
    setDateValidationError(null);
    return true;
  };

  const handleStartDateChange = (val: string) => {
    const newPeriodo = { ...formData.periodo, fechaInicio: val };
    validateDates(val, newPeriodo.fechaFin);
    
    // Sugerencia de duración en días si ambas fechas están presentes
    if (val && newPeriodo.fechaFin && val <= newPeriodo.fechaFin) {
      const d1 = new Date(val);
      const d2 = new Date(newPeriodo.fechaFin);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      newPeriodo.duracionValor = diffDays;
      if (!newPeriodo.duracionUnidad || newPeriodo.duracionUnidad === 'indefinido') {
        newPeriodo.duracionUnidad = 'días';
      }
    }

    setFormData((prev) => ({ ...prev, periodo: newPeriodo }));
  };

  const handleEndDateChange = (val: string) => {
    const newPeriodo = { ...formData.periodo, fechaFin: val };
    validateDates(newPeriodo.fechaInicio, val);

    // Sugerencia de duración en días si ambas fechas están presentes
    if (newPeriodo.fechaInicio && val && newPeriodo.fechaInicio <= val) {
      const d1 = new Date(newPeriodo.fechaInicio);
      const d2 = new Date(val);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      newPeriodo.duracionValor = diffDays;
      if (!newPeriodo.duracionUnidad || newPeriodo.duracionUnidad === 'indefinido') {
        newPeriodo.duracionUnidad = 'días';
      }
    }

    setFormData((prev) => ({ ...prev, periodo: newPeriodo }));
  };

  const handleDurationValueChange = (val: number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      periodo: { ...prev.periodo, duracionValor: val },
    }));
  };

  const handleDurationUnitChange = (unidad: PropuestaDuracionUnidad) => {
    setFormData((prev) => ({
      ...prev,
      periodo: { ...prev.periodo, duracionUnidad: unidad },
    }));
  };

  // Manejo de Monto acordado
  const handleAmountValueChange = (raw: string) => {
    if (raw === '') {
      setAmountValidationError(null);
      setFormData((prev) => ({
        ...prev,
        monto: { ...prev.monto, valor: undefined },
      }));
      return;
    }

    const num = parseFloat(raw);
    if (isNaN(num)) {
      setAmountValidationError('Debe ingresar un valor numérico válido.');
    } else if (num < 0) {
      setAmountValidationError('El monto de la propuesta no puede ser negativo.');
    } else {
      setAmountValidationError(null);
    }

    setFormData((prev) => ({
      ...prev,
      monto: { ...prev.monto, valor: isNaN(num) ? undefined : num },
    }));
  };

  const handleCurrencyChange = (moneda: PropuestaMoneda) => {
    setFormData((prev) => ({
      ...prev,
      monto: { ...prev.monto, moneda },
    }));
  };

  // Manejo de Soportes: Agregar y Quitar
  const handleAddSupport = () => {
    if (!selectedSupportToAdd) return;

    const catalogItem = availableSupports.find((s) => s.id === selectedSupportToAdd);
    if (!catalogItem) return;

    const currentList = formData.soportes || [];
    // Evitar duplicados
    if (currentList.some((s) => s.id === catalogItem.id)) {
      setActionFeedback(`El soporte ${catalogItem.id} ya forma parte de esta propuesta.`);
      setTimeout(() => setActionFeedback(null), 3000);
      return;
    }

    const newSupportItem: MediaKitPropuestaSupport = {
      id: catalogItem.id,
      nombre: catalogItem.nombre,
      tipo: catalogItem.tipo,
      direccion: catalogItem.direccion,
      localidad: catalogItem.localidad,
      medidas: catalogItem.medidas,
      formato: catalogItem.formato,
      caras: catalogItem.caras,
      disponibilidad: catalogItem.disponibilidad,
    };

    setFormData((prev) => ({
      ...prev,
      soportes: [...(prev.soportes || []), newSupportItem],
    }));
    setSelectedSupportToAdd('');
    setActionFeedback(`Soporte ${catalogItem.id} añadido a la propuesta local.`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleRemoveSupport = (supportId: string) => {
    setFormData((prev) => ({
      ...prev,
      soportes: (prev.soportes || []).filter((s) => s.id !== supportId),
    }));
    setActionFeedback(`Soporte ${supportId} retirado de la propuesta.`);
    setTimeout(() => setActionFeedback(null), 2500);
  };

  // Guardar cambios en UI presentacional
  const handleSaveProposal = () => {
    if (dateValidationError || amountValidationError) {
      return;
    }

    if (onSavePresentational && formData.id) {
      onSavePresentational(formData as MediaKitRequestItem);
    }
    setActionFeedback('Propuesta comercial actualizada localmente en memoria de interfaz.');
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleAction = (actionName: string) => {
    setActionFeedback(`Acción "${actionName}" registrada en modo presentacional. Integración de backend pendiente.`);
    if (onStatusChangePresentational && (actionName === 'Aprobar' || actionName === 'Rechazar')) {
      onStatusChangePresentational(
        request.id,
        actionName === 'Aprobar' ? 'Aprobada' : 'Rechazada'
      );
    }
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const currentSupports = formData.soportes || [];
  const currentPeriodo = formData.periodo || {};
  const currentMonto = formData.monto || {};

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          aria-label="Panel de detalle de solicitud de media kit"
          className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between"
        >
          {/* Header del Drawer */}
          <div className="p-6 border-b border-slate-100 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Propuesta de Media Kit</h2>
                <StatusBadge status={request.estado} />
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span className="font-semibold text-slate-700 font-mono">{request.id}</span>
                <span>•</span>
                <span>{request.cliente}</span>
                <span>•</span>
                <span>{request.campana}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación de Pestañas */}
          <div className="flex items-center px-6 border-b border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`py-3 text-sm font-medium transition-colors relative cursor-pointer mr-6 ${
                activeTab === 'info'
                  ? 'text-[#2563EB]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Propuesta Comercial y Soportes
              {activeTab === 'info' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('materiales')}
              className={`py-3 text-sm font-medium transition-colors relative cursor-pointer mr-6 ${
                activeTab === 'materiales'
                  ? 'text-[#2563EB]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Materiales
              {activeTab === 'materiales' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('historial')}
              className={`py-3 text-sm font-medium transition-colors relative cursor-pointer ${
                activeTab === 'historial'
                  ? 'text-[#2563EB]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Historial
              {activeTab === 'historial' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-full" />
              )}
            </button>
          </div>

          {/* Contenido con Scroll Independiente */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {actionFeedback && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-xs text-blue-800">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>{actionFeedback}</span>
              </div>
            )}

            <IntegrationNotice message="Panel de propuesta desacoplado. Modificar soportes aquí no altera reservas en inventario ni persiste en base de datos." />

            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* 1. Contexto de la Solicitud */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Datos de la Solicitud
                    </span>
                    <span className="text-xs text-slate-400">
                      {request.fechaSolicitud}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        Cliente
                      </p>
                      <p className="font-semibold text-slate-800 mt-0.5">{request.cliente}</p>
                      <p className="text-slate-500 text-[11px]">{request.clienteEmail || 'Sin email registrado'}</p>
                    </div>

                    <div>
                      <p className="text-slate-400 flex items-center gap-1">
                        <Megaphone className="w-3 h-3 text-slate-400" />
                        Campaña
                      </p>
                      <p className="font-semibold text-slate-800 mt-0.5">{request.campana}</p>
                      <p className="text-slate-500 text-[11px]">{request.campanaTipo || 'Comercial'}</p>
                    </div>

                    <div>
                      <p className="text-slate-400 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        Media Kit
                      </p>
                      <p className="font-semibold text-slate-800 mt-0.5">{request.mediaKit}</p>
                    </div>

                    <div>
                      <p className="text-slate-400 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-400" />
                        Solicitante
                      </p>
                      <p className="font-semibold text-slate-800 mt-0.5">{request.solicitante || 'Equipo de Ventas'}</p>
                    </div>
                  </div>

                  {request.descripcion && (
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                      <p className="text-slate-400 text-[11px] mb-0.5">Notas del anunciante:</p>
                      <p className="italic">{request.descripcion}</p>
                    </div>
                  )}
                </div>

                {/* 2. Soportes Incluidos en la Propuesta */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#2563EB]" />
                        <span>Soportes Incluidos</span>
                        <span className="text-xs bg-blue-50 text-[#2563EB] font-medium px-2 py-0.5 rounded-full">
                          {currentSupports.length} {currentSupports.length === 1 ? 'soporte' : 'soportes'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Soportes seleccionados del catálogo para componer la propuesta.
                      </p>
                    </div>
                  </div>

                  {/* Selector para agregar soporte desde el catálogo */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Agregar soporte a la propuesta
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <select
                        value={selectedSupportToAdd}
                        onChange={(e) => setSelectedSupportToAdd(e.target.value)}
                        className="flex-1 bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 cursor-pointer"
                        aria-label="Seleccionar soporte para agregar"
                      >
                        <option value="">-- Seleccionar soporte del catálogo --</option>
                        {availableSupports.map((supp) => {
                          const isAlreadyAdded = currentSupports.some((s) => s.id === supp.id);
                          return (
                            <option
                              key={supp.id}
                              value={supp.id}
                              disabled={isAlreadyAdded}
                            >
                              [{supp.id}] {supp.nombre} — {supp.tipo} ({supp.medidas || 'Sin medidas'}) • {supp.disponibilidad} {isAlreadyAdded ? '✓ Ya incluido' : ''}
                            </option>
                          );
                        })}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddSupport}
                        disabled={!selectedSupportToAdd}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors shadow-2xs cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar soporte</span>
                      </button>
                    </div>
                  </div>

                  {/* Lista de Soportes en la Propuesta */}
                  {currentSupports.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50 space-y-1">
                      <Layers className="w-7 h-7 text-slate-300 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-slate-700">Sin soportes en la propuesta</p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Esta solicitud aún no incluye soportes asignados. Utilizá el selector superior para incorporar ubicaciones del catálogo.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {currentSupports.map((supp) => {
                        const isReserved = supp.disponibilidad === 'Reservado';
                        const isPendingMapping = supp.tipo === 'Pendiente de mapeo';

                        return (
                          <div
                            key={supp.id}
                            className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs hover:border-slate-300 transition-all space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold text-slate-700">
                                    {supp.id}
                                  </span>
                                  <span className="text-sm font-semibold text-slate-900">
                                    {supp.nombre}
                                  </span>
                                  <StatusBadge status={supp.disponibilidad} />
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                                  <TypeIcon type={supp.tipo} />
                                  {supp.medidas && (
                                    <span className="flex items-center gap-1">
                                      <Ruler className="w-3 h-3 text-slate-400" />
                                      {supp.medidas}
                                    </span>
                                  )}
                                  {supp.caras !== undefined && (
                                    <span>{supp.caras} {supp.caras === 1 ? 'cara' : 'caras'}</span>
                                  )}
                                  {supp.direccion && (
                                    <span>• {supp.direccion}, {supp.localidad}</span>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveSupport(supp.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer shrink-0"
                                title="Quitar de la propuesta"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Alertas Contextuales */}
                            {isReserved && (
                              <div className="flex items-center gap-2 p-2 bg-amber-50/80 border border-amber-200 rounded-md text-[11px] text-amber-800">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>
                                  <strong>Atención comercial:</strong> Este soporte figura como <em>Reservado</em> en el catálogo. Verificá disponibilidad técnica antes de confirmar la pauta.
                                </span>
                              </div>
                            )}

                            {isPendingMapping && (
                              <div className="flex items-center gap-2 p-2 bg-slate-100 border border-slate-200 rounded-md text-[11px] text-slate-700">
                                <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span>
                                  <strong>Tipología pendiente de mapeo:</strong> El formato de este soporte requiere homologación en la base de datos real.
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Tiempo y Período Contratado */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-white">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#2563EB]" />
                      <span>Período y Duración de la Propuesta</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fechas de exhibición acordadas y unidad temporal configurable.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Fecha de inicio
                      </label>
                      <input
                        type="date"
                        value={currentPeriodo.fechaInicio || ''}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Fecha de finalización
                      </label>
                      <input
                        type="date"
                        value={currentPeriodo.fechaFin || ''}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB] transition-colors"
                      />
                    </div>
                  </div>

                  {dateValidationError && (
                    <div className="flex items-center gap-1.5 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{dateValidationError}</span>
                    </div>
                  )}

                  {/* Duración y Unidad */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Duración contratada</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentPeriodo.duracionValor ?? ''}
                        onChange={(e) =>
                          handleDurationValueChange(
                            e.target.value ? parseInt(e.target.value, 10) : undefined
                          )
                        }
                        placeholder="Ej. 30"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Unidad de tiempo
                      </label>
                      <select
                        value={currentPeriodo.duracionUnidad || 'días'}
                        onChange={(e) =>
                          handleDurationUnitChange(e.target.value as PropuestaDuracionUnidad)
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 cursor-pointer"
                      >
                        <option value="días">Días</option>
                        <option value="semanas">Semanas</option>
                        <option value="meses">Meses</option>
                        <option value="indefinido">Sin definir / Indefinido</option>
                      </select>
                    </div>
                  </div>

                  {/* Resumen del período */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-600 flex items-center justify-between">
                    <span className="text-slate-500">Resumen de exhibición:</span>
                    <span className="font-semibold text-slate-800">
                      {currentPeriodo.fechaInicio && currentPeriodo.fechaFin ? (
                        <>
                          {currentPeriodo.fechaInicio} al {currentPeriodo.fechaFin}
                          {currentPeriodo.duracionValor && (
                            <span className="text-[#2563EB] ml-1 font-medium">
                              ({currentPeriodo.duracionValor} {currentPeriodo.duracionUnidad})
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Período incompleto o por definir</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* 4. Monto Total Acordado de la Propuesta */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-white">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>Monto Total de la Propuesta</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Monto total comercial acordado. No calculado automáticamente a partir de tarifas internas.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Monto acordado
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={currentMonto.valor ?? ''}
                        onChange={(e) => handleAmountValueChange(e.target.value)}
                        placeholder="Ej. 1450000"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB] transition-colors font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Moneda comercial
                      </label>
                      <select
                        value={currentMonto.moneda || 'ARS'}
                        onChange={(e) => handleCurrencyChange(e.target.value as PropuestaMoneda)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 cursor-pointer font-mono"
                      >
                        <option value="ARS">ARS ($)</option>
                        <option value="USD">USD (U$S)</option>
                        <option value="Por definir">Por definir / Sin moneda</option>
                      </select>
                    </div>
                  </div>

                  {amountValidationError && (
                    <div className="flex items-center gap-1.5 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{amountValidationError}</span>
                    </div>
                  )}

                  {/* Vista previa del importe comercial */}
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-emerald-800 font-medium">Total de la propuesta pactada:</p>
                      <p className="text-base font-bold text-emerald-900 font-mono">
                        {currentMonto.valor !== undefined ? (
                          <>
                            {currentMonto.moneda === 'USD' ? 'U$S ' : '$ '}
                            {currentMonto.valor.toLocaleString('es-AR')}
                            {currentMonto.moneda && currentMonto.moneda !== 'Por definir' && (
                              <span className="text-xs text-emerald-700 font-normal ml-1">
                                {currentMonto.moneda}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-400 font-normal text-xs italic">
                            Monto no acordado todavía
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-[10px] bg-white border border-emerald-200 text-emerald-700 px-2 py-1 rounded">
                      Comercial cerrado
                    </span>
                  </div>
                </div>

                {/* 5. Botón para Confirmar Guardado de Cambios en la UI */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveProposal}
                    disabled={Boolean(dateValidationError || amountValidationError)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar cambios de la propuesta (local)</span>
                  </button>
                </div>

                {/* 6. Botones de Rechazar y Aprobar */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleAction('Rechazar')}
                    className="w-full py-2.5 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-center"
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction('Aprobar')}
                    className="w-full py-2.5 px-4 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm cursor-pointer text-center"
                  >
                    Aprobar propuesta
                  </button>
                </div>

                {/* 7. Acciones Adicionales */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <p className="text-xs font-semibold text-slate-700">Acciones adicionales</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleAction('Descargar materiales')}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Descargar materiales</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('Enviar correo')}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>Enviar correo</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAction('Ver historial')}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ver historial</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'materiales' && (
              <div className="space-y-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 text-sm">Archivos del Kit Digital</p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <p>• Especificaciones_Mupis_2025.pdf (2.4 MB)</p>
                  <p>• Plantillas_LED_1920x1080.zip (14.8 MB)</p>
                  <p>• Guia_Contenidos_OOH.pdf (1.1 MB)</p>
                </div>
              </div>
            )}

            {activeTab === 'historial' && (
              <div className="space-y-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 text-sm">Registro de Actividad</p>
                <div className="space-y-2 border-l-2 border-slate-200 pl-3">
                  <div>
                    <p className="font-medium text-slate-800">Solicitud creada</p>
                    <p className="text-[11px] text-slate-400">
                      {request.fechaSolicitud} por {request.solicitante || 'Usuario'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Soportes y propuesta registrados</p>
                    <p className="text-[11px] text-slate-400">
                      {currentSupports.length} soportes asignados
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Estado actual</p>
                    <p className="text-[11px] text-slate-400">
                      {request.estado}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
