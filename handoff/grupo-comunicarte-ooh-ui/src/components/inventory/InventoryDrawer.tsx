import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  Check,
  Star,
  Ruler,
  Layers,
  Activity,
  Tag,
} from 'lucide-react';
import {
  SupportItem,
  SupportType,
  SupportDisponibilidad,
  SupportEstadoOperativo,
} from '../../types/inventory';
import { StatusBadge } from '../ui/StatusBadge';
import { IntegrationNotice } from '../shared/StateNotice';

interface InventoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  support: SupportItem | null;
  onSavePresentational?: (updated: SupportItem) => void;
}

export const InventoryDrawer: React.FC<InventoryDrawerProps> = ({
  isOpen,
  onClose,
  support,
  onSavePresentational,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'ubicacion' | 'multimedia'>('info');

  // Estado del formulario local para interacción visual
  const [formData, setFormData] = useState<Partial<SupportItem>>({});
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    if (support) {
      setFormData({ ...support });
      setSaveNotice(null);
    }
  }, [support]);

  if (!isOpen || !support) return null;

  const handleInputChange = (field: keyof SupportItem, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveClick = () => {
    if (onSavePresentational && formData.id) {
      onSavePresentational(formData as SupportItem);
    }
    setSaveNotice('Cambio actualizado localmente en memoria de interfaz.');
    setTimeout(() => {
      setSaveNotice(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          aria-label="Panel de edición de soporte"
          className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between"
        >
          {/* Header del Drawer */}
          <div className="p-6 border-b border-slate-100 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Ficha del Soporte</h2>
                {formData.disponibilidad && (
                  <StatusBadge status={formData.disponibilidad} />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-slate-500 font-mono">
                  {support.id}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-600 font-medium">
                  {formData.nombre || 'Sin título'}
                </span>
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
              Información Comercial y Técnica
              {activeTab === 'info' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ubicacion')}
              className={`py-3 text-sm font-medium transition-colors relative cursor-pointer mr-6 ${
                activeTab === 'ubicacion'
                  ? 'text-[#2563EB]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Ubicación
              {activeTab === 'ubicacion' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('multimedia')}
              className={`py-3 text-sm font-medium transition-colors relative cursor-pointer ${
                activeTab === 'multimedia'
                  ? 'text-[#2563EB]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Multimedia
              {activeTab === 'multimedia' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-full" />
              )}
            </button>
          </div>

          {/* Contenido con scroll independiente */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {saveNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveNotice}</span>
              </div>
            )}

            <IntegrationNotice message="Formulario desacoplado. Precios internos omitidos por contrato en vistas comerciales y presentacionales." />

            {activeTab === 'info' && (
              <div className="space-y-4">
                {/* 1. Nombre del soporte */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nombre del soporte <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre || ''}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                    placeholder="Ej. Cartel Avenida"
                  />
                </div>

                {/* 2. Tipología y Disponibilidad Comercial */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Tipología oficial <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.tipo || 'Tradicional'}
                      onChange={(e) =>
                        handleInputChange('tipo', e.target.value as SupportType)
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors cursor-pointer"
                    >
                      <option value="Tradicional">Tradicional</option>
                      <option value="LED móvil">LED móvil</option>
                      <option value="Pantallas LED">Pantallas LED</option>
                      <option value="Pendiente de mapeo">Pendiente de mapeo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Disponibilidad comercial <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.disponibilidad || 'Disponible'}
                      onChange={(e) =>
                        handleInputChange(
                          'disponibilidad',
                          e.target.value as SupportDisponibilidad
                        )
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors cursor-pointer"
                    >
                      <option value="Disponible">● Disponible</option>
                      <option value="Reservado">● Reservado</option>
                    </select>
                  </div>
                </div>

                {/* 3. Control de Soporte Destacado (Atributo Comercial) */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star
                        className={`w-4 h-4 ${
                          formData.destacado
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-400'
                        }`}
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800">
                          Soporte destacado
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Prioriza la visualización y promoción comercial de este soporte
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(formData.destacado)}
                        onChange={(e) =>
                          handleInputChange('destacado', e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2563EB]"></div>
                    </label>
                  </div>
                </div>

                {/* 4. Atributos Visibles de la Ficha (Medidas, Formato, Impacto, Caras) */}
                <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 border-b border-slate-200 pb-2">
                    <Tag className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Atributos Físicos y de Rendimiento</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Medidas */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                        <Ruler className="w-3 h-3 text-slate-400" />
                        <span>Medidas</span>
                      </label>
                      <input
                        type="text"
                        value={formData.medidas || ''}
                        onChange={(e) => handleInputChange('medidas', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                        placeholder="Ej. 8.00 x 4.00 m"
                      />
                    </div>

                    {/* Caras */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span>Caras</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.caras ?? 1}
                        onChange={(e) =>
                          handleInputChange('caras', parseInt(e.target.value, 10) || 1)
                        }
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Formato */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Formato
                      </label>
                      <input
                        type="text"
                        value={formData.formato || ''}
                        onChange={(e) => handleInputChange('formato', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                        placeholder="Ej. Monoposte Frontlight"
                      />
                    </div>

                    {/* Impacto Mensual */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                        <Activity className="w-3 h-3 text-slate-400" />
                        <span>Impacto mensual</span>
                      </label>
                      <input
                        type="text"
                        value={formData.impactoMensual || ''}
                        onChange={(e) =>
                          handleInputChange('impactoMensual', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                        placeholder="Ej. 450.000 impactos/mes"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Dirección */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Dirección <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.direccion || ''}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                    placeholder="Dirección completa"
                  />
                </div>

                {/* 6. Localidad y Código Postal */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Localidad <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.localidad || 'Mendoza'}
                      onChange={(e) => handleInputChange('localidad', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors cursor-pointer"
                    >
                      <option value="Mendoza">Mendoza</option>
                      <option value="Luján de Cuyo">Luján de Cuyo</option>
                      <option value="Guaymallén">Guaymallén</option>
                      <option value="San Rafael">San Rafael</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Código postal
                    </label>
                    <input
                      type="text"
                      value={formData.codigoPostal || '5500'}
                      onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                      placeholder="5500"
                    />
                  </div>
                </div>

                {/* 7. Estado Operativo Técnico (Separado de la Disponibilidad) */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Estado operativo técnico (no comercial)
                  </label>
                  <select
                    value={formData.estadoOperativo || 'Operativo'}
                    onChange={(e) =>
                      handleInputChange(
                        'estadoOperativo',
                        e.target.value as SupportEstadoOperativo
                      )
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors cursor-pointer text-slate-600"
                  >
                    <option value="Operativo">Operativo (En condiciones físicas)</option>
                    <option value="Mantenimiento">Mantenimiento (Inspección técnica)</option>
                    <option value="Inactivo">Inactivo temporal</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Indica la condición física estructural del soporte, independiente de su reserva comercial.
                  </p>
                </div>

                {/* 8. Coordenadas */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Coordenadas
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      step="any"
                      value={formData.latitud ?? -32.8908}
                      onChange={(e) =>
                        handleInputChange('latitud', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                      placeholder="Latitud"
                    />
                    <input
                      type="number"
                      step="any"
                      value={formData.longitud ?? -68.8458}
                      onChange={(e) =>
                        handleInputChange('longitud', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                      placeholder="Longitud"
                    />
                  </div>
                </div>

                {/* 9. Descripción */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descripcion || ''}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors resize-none"
                    placeholder="Descripción y detalles de visibilidad del soporte..."
                  />
                </div>

                {/* 10. Imagen del soporte */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Imagen del soporte
                  </label>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="w-16 h-14 bg-slate-200 rounded-md flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <button
                        type="button"
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Cambiar imagen
                      </button>
                      <p className="text-[11px] text-slate-400 mt-1">JPG, PNG. Máx. 5 MB</p>
                    </div>
                  </div>
                </div>

                {/* 11. Vista en mapa */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Vista en mapa
                  </label>
                  <div className="relative h-28 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:12px_12px]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-lg ring-4 ring-blue-100">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white/95 backdrop-blur-xs text-slate-700 border border-slate-200 rounded shadow-xs hover:bg-white transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3 h-3 text-[#2563EB]" />
                        <span>Ver en mapa</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ubicacion' && (
              <div className="space-y-4 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 text-sm">Georreferenciación y Entorno</p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <p><strong>Corredor vial:</strong> Acceso principal metropolitano</p>
                  <p><strong>Orientación:</strong> Norte - Sur (tránsito hacia centro)</p>
                  <p><strong>Velocidad media de tránsito:</strong> 40 km/h</p>
                  <p><strong>Impacto estimado mensual:</strong> {formData.impactoMensual || 'No especificado'}</p>
                </div>
              </div>
            )}

            {activeTab === 'multimedia' && (
              <div className="space-y-4 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 text-sm">Galería de Fotografías de Relevamiento</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-28 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span>Vista diurna</span>
                  </div>
                  <div className="h-28 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span>Vista nocturna</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer del Drawer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveClick}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Guardar cambios
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
