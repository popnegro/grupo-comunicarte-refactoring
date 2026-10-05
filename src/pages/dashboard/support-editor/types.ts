export type SupportType = 'tradicional' | 'led' | 'led_movil';
export type MediaKind = 'image' | 'video';
export type Plaza = 'mendoza' | 'buenos-aires';
export type EditorTab = 'general' | 'location' | 'content' | 'commercial';

export type FormState = {
  publicName: string;
  ciudad: Plaza;
  tipo_soporte: SupportType;
  active: boolean;
  disponibilidad: 'disponible' | 'reservado';
  isFeatured: boolean;
  address: string;
  lat: string;
  lng: string;
  mapa_url: string;
  description: string;
  coverUrl: string;
  coverKind: MediaKind;
  restMedia: string[];
  traditional: {
    formato: string;
    medidas: string;
    caras: string;
    impresion: string;
    monthly_impacts: string;
  };
  led: {
    formato: string;
    medidas: string;
    resolucion: string;
    frecuencia: string;
    video_mode: string;
    spot_duration: string;
    monthly_impacts: string;
  };
  mobile: {
    pantalla: string;
    resolucion: string;
    spot_duration: string;
    minimum_daily_outings: string;
    recorrido: string;
    operation_days: string;
    duration: string;
    monthly_impacts: string;
  };
  pricing: {
    exhibition: string;
    installation: string;
    printing: string;
    monthly: string;
    exclusive: string;
    currency: string;
  };
  reservedFrom: string;
  reservedUntil: string;
};

export const emptyForm: FormState = {
  publicName: '',
  ciudad: 'mendoza',
  tipo_soporte: 'tradicional',
  active: true,
  disponibilidad: 'disponible',
  isFeatured: false,
  address: '',
  lat: '',
  lng: '',
  mapa_url: '',
  description: '',
  coverUrl: '',
  coverKind: 'image',
  restMedia: [],
  traditional: { formato: '', medidas: '', caras: '', impresion: '', monthly_impacts: '' },
  led: {
    formato: '',
    medidas: '',
    resolucion: '',
    frecuencia: '',
    video_mode: '',
    spot_duration: '',
    monthly_impacts: '',
  },
  mobile: {
    pantalla: '',
    resolucion: '',
    spot_duration: '',
    minimum_daily_outings: '',
    recorrido: '',
    operation_days: '',
    duration: '',
    monthly_impacts: '',
  },
  pricing: {
    exhibition: '',
    installation: '',
    printing: '',
    monthly: '',
    exclusive: '',
    currency: 'ARS',
  },
  reservedFrom: '',
  reservedUntil: '',
};

export const EDITOR_TABS: { id: EditorTab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'location', label: 'Ubicación' },
  { id: 'content', label: 'Contenido' },
  { id: 'commercial', label: 'Comercial' },
];
