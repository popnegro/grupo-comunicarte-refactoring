/**
 * TIPOS DE MEDIA KITS Y DETALLE COMERCIAL DE PROPUESTAS
 * Contrato de UI presentacional para Grupo Comunicarte OOH.
 * Define la estructura de solicitudes, soportes incluidos, períodos de exhibición y montos acordados.
 */
import { SupportType, SupportDisponibilidad } from './inventory';

export type MediaKitStatus = 'Pendiente' | 'En revisión' | 'Aprobada' | 'Rechazada';

// Unidades configurables de duración comercial (no se asume una duración fija predeterminada)
export type PropuestaDuracionUnidad = 'días' | 'semanas' | 'meses' | 'indefinido';

// Monedas comerciales admitidas cuando estén expresamente definidas
export type PropuestaMoneda = 'ARS' | 'USD' | 'Por definir';

// Período de exhibición contratado en la propuesta
export interface PropuestaPeriodo {
  fechaInicio?: string; // Formato YYYY-MM-DD
  fechaFin?: string;    // Formato YYYY-MM-DD
  duracionValor?: number;
  duracionUnidad?: PropuestaDuracionUnidad;
}

// Monto total acordado de la propuesta (no confundir con precios internos de exhibición, instalación o impresión)
export interface PropuestaMonto {
  valor?: number;
  moneda?: PropuestaMoneda;
}

// Soporte incorporado a la propuesta comercial
export interface MediaKitPropuestaSupport {
  id: string; // e.g., 'SC-001'
  nombre: string;
  tipo: SupportType;
  direccion?: string;
  localidad?: string;
  medidas?: string;
  formato?: string;
  caras?: number;
  disponibilidad: SupportDisponibilidad; // Indica si en catálogo está 'Disponible' o 'Reservado'
}

export interface MediaKitRequestItem {
  id: string; // e.g., 'MK-001'
  cliente: string;
  clienteEmail?: string;
  campana: string;
  campanaTipo?: string;
  mediaKit: string;
  mediaKitDetalle?: string;
  fechaSolicitud: string;
  estado: MediaKitStatus;
  descripcion?: string;
  solicitante?: string;
  solicitanteEmail?: string;

  // Detalle comercial de la propuesta
  soportes?: MediaKitPropuestaSupport[];
  periodo?: PropuestaPeriodo;
  monto?: PropuestaMonto;
}

export interface MediaKitFilterState {
  search: string;
  estado: string;
  campana: string;
  viewMode: 'lista' | 'mapa';
  page: number;
  pageSize: number;
}
