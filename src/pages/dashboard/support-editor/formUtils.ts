import type { SupportFamily } from '../../../types';
import type { FormState, Plaza, SupportType } from './types';
import { emptyForm } from './types';

export const familyFor = (type: SupportType): SupportFamily =>
  type === 'led' ? 'led' : type === 'led_movil' ? 'led_mobile' : 'traditional';

export const text = (v: unknown) => (v == null ? '' : String(v));

export const splitPeriod = (v: unknown) => {
  if (typeof v !== 'string' || !v) return { from: '', until: '' };
  const [from, until] = v.split('|');
  return { from: from || '', until: until || '' };
};

/** Stable dirty check — compares field-by-field without whole-object JSON key-order issues. */
export function isFormDirty(a: FormState, b: FormState): boolean {
  if (a.publicName !== b.publicName) return true;
  if (a.ciudad !== b.ciudad) return true;
  if (a.tipo_soporte !== b.tipo_soporte) return true;
  if (a.active !== b.active) return true;
  if (a.disponibilidad !== b.disponibilidad) return true;
  if (a.isFeatured !== b.isFeatured) return true;
  if (a.address !== b.address) return true;
  if (a.lat !== b.lat) return true;
  if (a.lng !== b.lng) return true;
  if (a.mapa_url !== b.mapa_url) return true;
  if (a.description !== b.description) return true;
  if (a.coverUrl !== b.coverUrl) return true;
  if (a.coverKind !== b.coverKind) return true;
  if (a.reservedFrom !== b.reservedFrom) return true;
  if (a.reservedUntil !== b.reservedUntil) return true;
  if (a.restMedia.length !== b.restMedia.length) return true;
  if (a.restMedia.some((v, i) => v !== b.restMedia[i])) return true;

  const nestedKeys = ['traditional', 'led', 'mobile', 'pricing'] as const;
  for (const key of nestedKeys) {
    const av = a[key] as Record<string, string>;
    const bv = b[key] as Record<string, string>;
    for (const k of Object.keys(av)) {
      if (av[k] !== bv[k]) return true;
    }
  }
  return false;
}

export function extractCoordsFromUrl(raw: string): { lat: string; lng: string } | null {
  const cleanText = raw.trim();
  if (!cleanText) return null;

  const directMatch = cleanText.match(/^([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)$/);
  if (directMatch) return { lat: directMatch[1], lng: directMatch[2] };

  const atMatch = cleanText.match(/@([+-]?\d+(?:\.\d+)?),([+-]?\d+(?:\.\d+)?)/);
  if (atMatch) return { lat: atMatch[1], lng: atMatch[2] };

  const queryMatch = cleanText.match(
    /[?&](?:q|query|loc|location)=([+-]?\d+(?:\.\d+)?),([+-]?\d+(?:\.\d+)?)/,
  );
  if (queryMatch) return { lat: queryMatch[1], lng: queryMatch[2] };

  const genericMatch = cleanText.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (genericMatch) return { lat: genericMatch[1], lng: genericMatch[2] };

  return null;
}

export function normalize(item: any): FormState {
  const technical = item?.technical || {};
  const pricing = item?.pricing || {};
  const route = item?.route || {};
  const images = Array.isArray(item?.imageUrls) ? item.imageUrls.map(String).filter(Boolean) : [];
  const period = splitPeriod(item?.availableFrom);
  return {
    ...emptyForm,
    publicName: text(item?.name),
    ciudad: (item?.ciudad || 'mendoza') as Plaza,
    tipo_soporte: (item?.tipo_soporte || 'tradicional') as SupportType,
    active: item?.active !== false,
    disponibilidad: item?.disponibilidad === 'reservado' ? 'reservado' : 'disponible',
    isFeatured: item?.isFeatured === true,
    address: text(item?.address),
    lat: text(item?.lat),
    lng: text(item?.lng),
    mapa_url: text(item?.mapa_url),
    description: text(item?.description),
    coverUrl: images[0] || '',
    coverKind: technical?.metadata?.cover_media_type === 'video' ? 'video' : 'image',
    restMedia: images.slice(1, 3),
    traditional: {
      formato: text(technical.formato || technical.format),
      medidas: text(technical.measures),
      caras: text(technical.caras),
      impresion: text(technical.impresion),
      monthly_impacts: text(technical.monthly_impacts),
    },
    led: {
      formato: text(technical.formato || technical.format),
      medidas: text(technical.measures),
      resolucion: text(technical.resolution),
      frecuencia: text(technical.daily_frequency),
      video_mode: text(technical.video_mode),
      spot_duration: text(technical.spot_duration_seconds),
      monthly_impacts: text(technical.monthly_impacts),
    },
    mobile: {
      pantalla: text(technical.pantalla || technical.measures),
      resolucion: text(technical.resolution),
      spot_duration: text(technical.spot_duration_seconds),
      minimum_daily_outings: text(technical.minimum_daily_outings),
      recorrido: text(route.route_name || route.schedule || technical.summary),
      operation_days: text(technical.operation_days || route.weekdays),
      duration: text(route.duration || technical.route_duration_hours),
      monthly_impacts: text(technical.monthly_impacts),
    },
    pricing: {
      exhibition: text(pricing.exhibition_price),
      installation: text(pricing.installation_price),
      printing: text(pricing.printing_price),
      monthly: text(pricing.monthly_price),
      exclusive: text(pricing.exclusive_price),
      currency: text(pricing.currency || 'ARS'),
    },
    reservedFrom: text(item?.reservedFrom || period.from),
    reservedUntil: text(item?.reservedUntil || period.until),
  };
}

export function payloadFrom(form: FormState) {
  if (form.publicName.trim().length < 2) {
    throw new Error('Completá el Nombre público del soporte.');
  }
  if (form.disponibilidad === 'reservado' && (!form.reservedFrom || !form.reservedUntil)) {
    throw new Error('Para un soporte reservado, completá Desde y Hasta.');
  }
  if (form.disponibilidad === 'reservado' && form.reservedUntil < form.reservedFrom) {
    throw new Error('La fecha Hasta no puede ser anterior a Desde.');
  }

  let technical: any = {};
  if (form.tipo_soporte === 'tradicional') {
    technical = {
      summary: form.traditional.formato,
      measures: form.traditional.medidas,
      formato: form.traditional.formato,
      caras: Number(form.traditional.caras || 0),
      impresion: form.traditional.impresion,
      monthly_impacts:
        form.traditional.monthly_impacts === '' ? null : Number(form.traditional.monthly_impacts),
    };
  }
  if (form.tipo_soporte === 'led') {
    technical = {
      summary: form.led.formato,
      measures: form.led.medidas,
      formato: form.led.formato,
      resolution: form.led.resolucion,
      daily_frequency: form.led.frecuencia,
      video_mode: form.led.video_mode,
      spot_duration_seconds: Number(form.led.spot_duration || 0),
      monthly_impacts: form.led.monthly_impacts === '' ? null : Number(form.led.monthly_impacts),
    };
  }
  if (form.tipo_soporte === 'led_movil') {
    technical = {
      summary: form.mobile.pantalla,
      measures: form.mobile.pantalla,
      resolution: form.mobile.resolucion,
      spot_duration_seconds: Number(form.mobile.spot_duration || 0),
      minimum_daily_outings: Number(form.mobile.minimum_daily_outings || 0),
      operation_days: form.mobile.operation_days,
      monthly_impacts:
        form.mobile.monthly_impacts === '' ? null : Number(form.mobile.monthly_impacts),
      route_duration_hours: form.mobile.duration === '' ? null : Number(form.mobile.duration),
    };
  }
  technical.metadata = { cover_media_type: form.coverKind };

  return {
    name: form.publicName.trim(),
    ciudad: form.ciudad,
    tipo_soporte: form.tipo_soporte,
    family: familyFor(form.tipo_soporte),
    active: form.active,
    disponibilidad: form.disponibilidad,
    availableFrom:
      form.disponibilidad === 'reservado' ? `${form.reservedFrom}|${form.reservedUntil}` : null,
    isFeatured: form.isFeatured,
    address: form.address.trim(),
    lat: form.lat === '' ? null : Number(form.lat),
    lng: form.lng === '' ? null : Number(form.lng),
    mapa_url: form.mapa_url.trim(),
    description: form.description.trim(),
    imageUrls: [form.coverUrl, ...form.restMedia].map((v) => v.trim()).filter(Boolean).slice(0, 3),
    technical,
    pricing: {
      exhibition_price: Number(form.pricing.exhibition || 0),
      installation_price: Number(form.pricing.installation || 0),
      printing_price: Number(form.pricing.printing || 0),
      monthly_price: Number(form.pricing.monthly || 0),
      exclusive_price: Number(form.pricing.exclusive || 0),
      currency: form.pricing.currency,
    },
    ...(form.tipo_soporte === 'led_movil'
      ? {
          route: {
            route_name: form.mobile.recorrido,
            schedule: form.mobile.operation_days,
            duration: form.mobile.duration,
            route_mode: 'led_mobile',
            routePath: [],
            waypoints: [],
          },
        }
      : {}),
  };
}
