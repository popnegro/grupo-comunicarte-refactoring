/**
 * TIPOS DE INVENTARIO — CONTRATO OBLIGATORIO GRUPO COMUNICARTE OOH
 * Define los tipos comerciales y estructurales de los soportes.
 */

// Tipologías comerciales autorizadas para la UI
export type SupportType = 'Tradicional' | 'LED móvil' | 'Pantallas LED' | 'Pendiente de mapeo';

// Disponibilidad comercial permitida exclusivamente
export type SupportDisponibilidad = 'Disponible' | 'Reservado';

// Estado operativo técnico/físico (conservado separado de la disponibilidad comercial)
export type SupportEstadoOperativo = 'Operativo' | 'Mantenimiento' | 'Inactivo' | 'En revisión';

export interface SupportItem {
  id: string; // e.g., 'SC-001'
  nombre: string;
  tipo: SupportType;
  direccion: string;
  localidad: string;
  codigoPostal?: string;
  
  // Disponibilidad comercial estricta
  disponibilidad: SupportDisponibilidad;
  
  // Atributo comercial de destacado
  destacado: boolean;
  
  // Atributos visibles obligatorios de la ficha del soporte
  medidas?: string;          // Ej: "8.00 x 4.00 m"
  formato?: string;          // Ej: "Monoposte Frontlight", "Pórtico", "Pantalla LED Exterior"
  impactoMensual?: string;   // Ej: "420.000 impactos/mes"
  caras?: number;            // Ej: 1 o 2 caras
  
  // Estado operativo técnico independiente (opcional, nunca confunde la disponibilidad comercial)
  estadoOperativo?: SupportEstadoOperativo;
  
  // Georreferenciación y multimedia
  latitud?: number;
  longitud?: number;
  descripcion?: string;
  imagenUrl?: string;
}

export interface InventoryFilterState {
  search: string;
  tipo: string;
  disponibilidad: string;
  destacado: string; // 'todos' | 'destacados' | 'no-destacados'
  viewMode: 'lista' | 'mapa';
  page: number;
  pageSize: number;
}
