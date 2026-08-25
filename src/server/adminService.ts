import crypto from 'crypto';
import { mediakitRequests, supports } from '../db/schema';
import { getAllMediakitRequestsFromDB } from './mediakitService';
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
} from './supportModel';
import { getAllSupportsFromDB, getSupportByIdFromDB } from './supportsService';
import { db } from '../db';
import { and, count, eq } from 'drizzle-orm';

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_SECRET = process.env.JWT_SECRET || process.env.ADMIN_SECRET;
const MAX_FEATURED_SUPPORTS = 9;

if (!ADMIN_USER || !ADMIN_PASSWORD || !ADMIN_SECRET) {
  throw new Error(
    'FATAL: ADMIN_USER, ADMIN_PASSWORD and JWT_SECRET (or legacy ADMIN_SECRET) environment variables are required.'
  );
}

const adminUser = ADMIN_USER;
const adminPassword = ADMIN_PASSWORD;
const adminSecret = ADMIN_SECRET;

export function authenticateAdmin(username: string, password: string): { success: boolean; token?: string; message?: string } {
  if (username === adminUser && password === adminPassword) {
    const expiresAt = Date.now() + 8 * 3600 * 1000; // 8 hours expiration
    const payload = `${username}:${expiresAt}`;
    const signature = crypto.createHmac('sha256', adminSecret).update(payload).digest('hex');
    const token = Buffer.from(`${payload}:${signature}`).toString('base64');
    return { success: true, token };
  }
  return { success: false, message: 'Credenciales inválidas. Verifica usuario y contraseña.' };
}

export function verifyAdminToken(authHeader?: string): boolean {
  if (!authHeader) return false;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return false;
  try {
    const decoded = Buffer.from(parts[1], 'base64').toString('utf8');
    const [username, expiresAtStr, signature] = decoded.split(':');
    if (!username || !expiresAtStr || !signature) return false;
    const expiresAt = Number(expiresAtStr);
    if (Date.now() > expiresAt) return false; // Token expired

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
  const family = resolveFamily(data, data.tipo_soporte);
  validateFamily(family);
  if (data.disponibilidad !== undefined) validateAvailability(data.disponibilidad);
  validateSupportPayload({ ...data, family });
  await assertFeaturedCapacity(null, data);

  if (data.canonical_id?.trim()) {
    const canonicalId = data.canonical_id.trim();
    const existing = await getSupportByIdFromDB(canonicalId, { includeInactive: true });
    if (existing) {
      throw new Error(`canonical_id duplicado: ${canonicalId}`);
    }
    return upsertSupportRecord(canonicalId, { ...data, family });
  }

  const baseCandidate = generateCanonicalId(data.name || '', data.ciudad || 'mendoza', family);
  const canonicalId = await ensureUniqueCanonicalId(baseCandidate);
  return upsertSupportRecord(canonicalId, { ...data, family });
}

export async function updateSupportByAdmin(canonicalId: string, data: SupportWritePayload) {
  await assertFeaturedCapacity(canonicalId, data);
  return patchSupportRecord(canonicalId, data);
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
