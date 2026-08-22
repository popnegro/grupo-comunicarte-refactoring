import crypto from 'crypto';
import { db } from '../db';
import { supports, mediakitRequests } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getAllSupportsFromDB } from './supportsService';
import { getAllMediakitRequestsFromDB } from './mediakitService';

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');
const ADMIN_SECRET = process.env.ADMIN_SECRET || crypto.randomBytes(32).toString('hex');

export function authenticateAdmin(username: string, password: string): { success: boolean; token?: string; message?: string } {
  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
    const expiresAt = Date.now() + 8 * 3600 * 1000; // 8 hours expiration
    const payload = `${username}:${expiresAt}`;
    const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
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
    const expectedSignature = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
    if (signature.length !== expectedSignature.length) return false;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

export async function getAdminStats() {
  const allSupports = await getAllSupportsFromDB();
  const allRequests = await getAllMediakitRequestsFromDB();

  const total = allSupports.length;
  const available = allSupports.filter((s) => s.disponibilidad === 'disponible').length;
  const reserved = allSupports.filter((s) => s.disponibilidad === 'reservado').length;
  const inactive = allSupports.filter((s) => (s as any).disponibilidad === 'inactivo').length;

  const mendozaSupports = allSupports.filter((s) => (s.ciudad || '').toLowerCase() === 'mendoza');
  const mendozaTotal = mendozaSupports.length;
  const mendozaAvailable = mendozaSupports.filter((s) => s.disponibilidad === 'disponible').length;

  const buenosAiresSupports = allSupports.filter((s) => (s.ciudad || '').toLowerCase() === 'buenos aires');
  const buenosAiresTotal = buenosAiresSupports.length;
  const buenosAiresAvailable = buenosAiresSupports.filter((s) => s.disponibilidad === 'disponible').length;

  const tradicionalCount = allSupports.filter((s) => (s.tipo_soporte || '') === 'tradicional').length;
  const ledCount = allSupports.filter((s) => (s.tipo_soporte || '') === 'led').length;
  const movilCount = allSupports.filter((s) => (s.tipo_soporte || '') === 'led_movil').length;

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

export async function updateSupportByAdmin(canonicalId: string, data: {
  name?: string;
  disponibilidad?: 'disponible' | 'reservado' | 'inactivo';
  description?: string;
  address?: string;
  characteristics?: string;
}) {
  const updateValues: any = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) updateValues.name = data.name;
  if (data.disponibilidad !== undefined) updateValues.disponibilidad = data.disponibilidad;
  if (data.description !== undefined) updateValues.description = data.description;
  if (data.address !== undefined) updateValues.address = data.address;
  if (data.characteristics !== undefined) updateValues.characteristics = data.characteristics;

  const result = await db
    .update(supports)
    .set(updateValues)
    .where(eq(supports.canonicalId, canonicalId))
    .returning();

  if (result.length === 0) {
    throw new Error(`Soporte con ID '${canonicalId}' no encontrado.`);
  }

  return result[0];
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
