import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { mediakitRequests, supports } from '../db/schema.ts';
import { getAllMediakitRequestsFromDB } from './mediakitService.ts';
import {
  createSupportMediaRecord,
  deleteSupportMediaRecord,
  deleteSupportRecord,
  getSupportPricingRecord,
  getSupportRouteRecord,
  listSupportMediaRecords,
  patchSupportRecord,
  resolveFamily,
  updateSupportPricingRecord,
  updateSupportRouteRecord,
  updateSupportMediaRecord,
  upsertSupportRecord,
  validateSupportPayload,
  generateCanonicalId,
  ensureUniqueCanonicalId,
  SupportWritePayload,
  validateFamily,
  validateAvailability,
} from './supportModel.ts';
import { getAllSupportsFromDB, getSupportByIdFromDB } from './supportsService.ts';
import { db } from '../db/index.ts';
import { and, count, eq } from 'drizzle-orm';

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const ADMIN_SECRET = process.env.JWT_SECRET || process.env.ADMIN_SECRET;
const MAX_FEATURED_SUPPORTS = 9;

const adminUser = ADMIN_USER;
const adminPasswordHash = ADMIN_PASSWORD_HASH;
const adminSecret = ADMIN_SECRET;

function canonicalizeEditorMedia<T extends SupportWritePayload>(data: T): T {
  if (data.media !== undefined || !Array.isArray(data.imageUrls)) return data;

  const urls = data.imageUrls.map((url) => String(url).trim()).filter(Boolean).slice(0, 3);
  if (urls.length === 0) return { ...data, media: [] };

  const coverType = (data.technical as any)?.metadata?.cover_media_type === 'video' ? 'video' : 'image';
  return {
    ...data,
    media: urls.map((url, index) => ({
      media_type: index === 0 ? coverType : 'image',
      url,
      sort_order: index,
      active: true,
      metadata: {
        source: 'support-editor',
        role: index === 0 ? 'cover' : 'gallery',
      },
    })),
  };
}

export async function authenticateAdmin(username: string, password: string): Promise<{ success: boolean; token?: string; message?: string }> {
  if (!adminUser || !adminPasswordHash || !adminSecret) {
    return { success: false, message: 'Autenticación administrativa no configurada.' };
  }

  if (username === adminUser && await bcrypt.compare(password, adminPasswordHash)) {
    const expiresAt = Date.now() + 8 * 3600 * 1000;
    const payload = `${username}:${expiresAt}`;
    const signature = crypto.createHmac('sha256', adminSecret).update(payload).digest('hex');
    const token = Buffer.from(`${payload}:${signature}`).toString('base64');
    return { success: true, token };
  }
  return { success: false, message: 'Credenciales inválidas. Verifica usuario y contraseña.' };
}

function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const prefix = name + '=';
  const entry = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined;
}

export function createAdminCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.VERCEL === 'true';
  return 'gc_admin_session=' + encodeURIComponent(token) + '; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800' + (secure ? '; Secure' : '');
}

export function clearAdminCookie(): string {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.VERCEL === 'true';
  return 'gc_admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0' + (secure ? '; Secure' : '');
}

export function verifyAdminToken(authHeader?: string, cookieHeader?: string): boolean {
  if (!adminSecret) return false;

  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const token = bearer && bearer !== 'cookie-session' ? bearer : readCookie(cookieHeader, 'gc_admin_session');
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [username, expiresAtStr, signature] = decoded.split(':');
    if (!username || !expiresAtStr || !signature) return false;
    const expiresAt = Number(expiresAtStr);
    if (Date.now() > expiresAt) return false;

    const payload = `${username}:${expiresAt}`;
    const expectedSignature = crypto.createHmac('sha256', adminSecret).update(payload).digest('hex');
    if (signature.length !== expectedSignature.length) return false;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

export async function getAdminStats() {
  const allSupports = await getAllSupportsFromDB({ includeInactive: true });
  const allRequests = await getAllMediakitRequestsFromDB();

  const total = allSupports.filter((s: any) => s.active !== false).length;
  const available = allSupports.filter((s: any) => s.active !== false && s.disponibilidad === 'disponible').length;
  const reserved = allSupports.filter((s: any) => s.active !== false && s.disponibilidad === 'reservado').length;
  const inactive = allSupports.filter((s: any) => s.active === false).length;

  const mendozaSupports = allSupports.filter((s: any) => s.active !== false && (s.ciudad || '').toLowerCase() === 'mendoza');
  const mendozaTotal = mendozaSupports.length;
  const mendozaAvailable = mendozaSupports.filter((s: any) => s.disponibilidad === 'disponible').length;

  const buenosAiresSupports = allSupports.filter((s: any) => s.active !== false && (s.ciudad || '').toLowerCase() === 'buenos-aires');
  const buenosAiresTotal = buenosAiresSupports.length;
  const buenosAiresAvailable = buenosAiresSupports.filter((s: any) => s.disponibilidad === 'disponible').length;

  const tradicionalCount = allSupports.filter((s: any) => s.active !== false && (s.family === 'traditional' || s.tipo_soporte === 'tradicional')).length;
  const ledCount = allSupports.filter((s: any) => s.active !== false && (s.family === 'led' || s.tipo_soporte === 'led')).length;
  const movilCount = allSupports.filter((s: any) => s.active !== false && (s.family === 'led_mobile' || s.tipo_soporte === 'led_movil')).length;

  const totalRequests = allRequests.length;
  const pendingRequests = allRequests.filter((r: any) => r.status === 'pending' || r.status === 'nuevo').length;

  return {
    total,
    available,
    reserved,
    inactive,
    mendozaTotal,
    mendozaAvailable,
    buenosAiresTotal,
    buenosAiresAvailable,
    tradicionalCount,
    ledCount,
    movilCount,
    totalRequests,
    pendingRequests,
  };
}

export async function listAdminSupports() {
  return getAllSupportsFromDB({ includeInactive: true });
}

export async function getAdminSupportById(canonicalId: string) {
  const support = await getSupportByIdFromDB(canonicalId, { includeInactive: true });
  if (!support) {
    throw new Error(`Soporte con ID '${canonicalId}' no encontrado.`);
  }
  return support;
}

async function assertFeaturedCapacity(canonicalId: string | null, data: SupportWritePayload) {
  const current = canonicalId
    ? await getSupportByIdFromDB(canonicalId, { includeInactive: true })
    : null;

  const nextFeatured = data.isFeatured === undefined ? current?.isFeatured === true : data.isFeatured === true;
  const nextActive = data.active === undefined ? current?.active !== false : data.active !== false;

  if (!nextFeatured || !nextActive) return;

  const currentlyFeatured = current?.isFeatured === true && current.active !== false;
  if (currentlyFeatured) return;

  const [result] = await db
    .select({ total: count() })
    .from(supports)
    .where(and(eq(supports.active, true), eq(supports.isFeatured, true)));

  if (Number(result?.total ?? 0) >= MAX_FEATURED_SUPPORTS) {
    throw new Error(`inválido: máximo ${MAX_FEATURED_SUPPORTS} soportes destacados activos permitidos.`);
  }
}

export async function createAdminSupport(data: SupportWritePayload & { canonical_id?: string }) {
  const canonicalData = canonicalizeEditorMedia(data);
  const family = resolveFamily(canonicalData, canonicalData.tipo_soporte);
  validateFamily(family);
  if (canonicalData.disponibilidad !== undefined) validateAvailability(canonicalData.disponibilidad);
  validateSupportPayload({ ...canonicalData, family });
  await assertFeaturedCapacity(null, canonicalData);

  if (canonicalData.canonical_id?.trim()) {
    const canonicalId = canonicalData.canonical_id.trim();
    const existing = await getSupportByIdFromDB(canonicalId, { includeInactive: true });
    if (existing) {
      throw new Error(`canonical_id duplicado: ${canonicalId}`);
    }
    return upsertSupportRecord(canonicalId, { ...canonicalData, family });
  }

  const baseCandidate = generateCanonicalId(canonicalData.name || '', canonicalData.ciudad || 'mendoza', family);
  const canonicalId = await ensureUniqueCanonicalId(baseCandidate);
  return upsertSupportRecord(canonicalId, { ...canonicalData, family });
}

export async function updateSupportByAdmin(canonicalId: string, data: SupportWritePayload) {
  const canonicalData = canonicalizeEditorMedia(data);
  await assertFeaturedCapacity(canonicalId, canonicalData);
  return patchSupportRecord(canonicalId, canonicalData);
}

export async function deactivateSupportByAdmin(canonicalId: string) {
  return deleteSupportRecord(canonicalId);
}

export async function updateSupportMediaByAdmin(canonicalId: string, mediaId: number, data: any) {
  return updateSupportMediaRecord(canonicalId, mediaId, data);
}

export async function addSupportMediaByAdmin(canonicalId: string, data: any) {
  return createSupportMediaRecord(canonicalId, data);
}

export async function removeSupportMediaByAdmin(canonicalId: string, mediaId: number) {
  return deleteSupportMediaRecord(canonicalId, mediaId);
}

export async function getSupportMediaByAdmin(canonicalId: string) {
  return listSupportMediaRecords(canonicalId);
}

export async function getSupportPricingByAdmin(canonicalId: string) {
  return getSupportPricingRecord(canonicalId);
}

export async function patchSupportPricingByAdmin(canonicalId: string, pricing: any) {
  return updateSupportPricingRecord(canonicalId, pricing);
}

export async function getSupportRouteByAdmin(canonicalId: string) {
  return getSupportRouteRecord(canonicalId);
}

export async function patchSupportRouteByAdmin(canonicalId: string, route: any) {
  return updateSupportRouteRecord(canonicalId, route);
}

export async function updateRequestStatusByAdmin(requestId: string, status: string) {
  const validStatuses = ['pending', 'nuevo', 'contacted', 'contactado', 'quoted', 'enviado', 'closed', 'cerrado', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Estado comercial inválido: ${status}`);
  }

  const result = await db
    .update(mediakitRequests)
    .set({ status, updatedAt: new Date() })
    .where(eq(mediakitRequests.requestId, requestId))
    .returning();

  if (result.length === 0) {
    throw new Error(`Solicitud con ID '${requestId}' no encontrada.`);
  }

  return result[0];
}
