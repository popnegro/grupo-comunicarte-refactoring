import { and, desc, eq } from 'drizzle-orm';
import { db, isDatabaseConfigured } from '../db/index.ts';
import { mediakits, mediakitItems } from '../db/schema.ts';

export type MediaKitStatus = 'draft' | 'ready' | 'sent' | 'archived';

export interface SaveMediaKitInput {
  kitId?: string;
  sourceRequestId?: string | null;
  status?: MediaKitStatus;
  clientName: string;
  clientEmail?: string | null;
  clientCompany?: string | null;
  clientPhone?: string | null;
  supportIds: string[];
  approvedPrices?: Record<string, string | number>;
  totalAmount?: number | string | null;
  currency?: string;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  pdfUrl?: string | null;
  pptUrl?: string | null;
}

export interface MediaKitRecord extends SaveMediaKitInput {
  kitId: string;
  status: MediaKitStatus;
  createdAt: string;
  updatedAt: string;
}

function makeKitId(): string {
  const year = new Date().getFullYear();
  const a = Math.floor(1000 + Math.random() * 9000);
  const b = Math.floor(1000 + Math.random() * 9000);
  return `KIT-${year}-${a}-${b}`;
}

function normalizeStatus(value: unknown): MediaKitStatus {
  return value === 'ready' || value === 'sent' || value === 'archived' ? value : 'draft';
}

function normalizeSupportIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)));
}

function rowToMediaKit(row: typeof mediakits.$inferSelect): MediaKitRecord {
  return {
    kitId: row.kitId,
    sourceRequestId: row.sourceRequestId,
    status: normalizeStatus(row.status),
    clientName: row.clientName,
    clientEmail: row.clientEmail,
    clientCompany: row.clientCompany,
    clientPhone: row.clientPhone,
    supportIds: row.supportIds || [],
    approvedPrices: row.approvedPrices || {},
    totalAmount: row.totalAmount,
    currency: row.currency,
    notes: row.notes,
    metadata: row.metadata || {},
    pdfUrl: row.pdfUrl,
    pptUrl: row.pptUrl,
    createdAt: new Date(row.createdAt || Date.now()).toISOString(),
    updatedAt: new Date(row.updatedAt || Date.now()).toISOString(),
  };
}

export async function saveMediaKit(input: SaveMediaKitInput): Promise<MediaKitRecord> {
  if (!isDatabaseConfigured) throw new Error('La persistencia de Media Kits requiere base de datos configurada.');
  const clientName = String(input.clientName || '').trim();
  if (clientName.length < 2) throw new Error('El nombre del cliente es obligatorio.');

  const supportIds = normalizeSupportIds(input.supportIds);
  const approvedPrices = Object.fromEntries(Object.entries(input.approvedPrices || {}).map(([key, value]) => [key, String(value)]));
  const status = normalizeStatus(input.status);
  const kitId = input.kitId?.trim() || makeKitId();
  const numericTotal = input.totalAmount == null || input.totalAmount === '' ? null : Number(input.totalAmount);

  return db.transaction(async (tx) => {
    const values = {
      kitId,
      sourceRequestId: input.sourceRequestId || null,
      status,
      clientName,
      clientEmail: input.clientEmail || null,
      clientCompany: input.clientCompany || null,
      clientPhone: input.clientPhone || null,
      supportIds,
      approvedPrices,
      totalAmount: Number.isFinite(numericTotal as number) ? String(numericTotal) : null,
      currency: input.currency || 'ARS',
      notes: input.notes || null,
      metadata: input.metadata || {},
      pdfUrl: input.pdfUrl || null,
      pptUrl: input.pptUrl || null,
      updatedAt: new Date(),
    };

    const [row] = await tx.insert(mediakits).values(values).onConflictDoUpdate({
      target: mediakits.kitId,
      set: values,
    }).returning();

    await tx.delete(mediakitItems).where(eq(mediakitItems.kitId, kitId));
    if (supportIds.length > 0) {
      await tx.insert(mediakitItems).values(supportIds.map((supportId, index) => {
        const price = approvedPrices[supportId] == null ? null : Number(approvedPrices[supportId]);
        return {
          kitId,
          supportId,
          approvedPrice: Number.isFinite(price as number) ? String(price) : null,
          sortOrder: index,
        };
      }));
    }

    return rowToMediaKit(row);
  });
}

export async function getMediaKit(kitId: string): Promise<MediaKitRecord | null> {
  if (!isDatabaseConfigured) return null;
  const [row] = await db.select().from(mediakits).where(eq(mediakits.kitId, kitId)).limit(1);
  return row ? rowToMediaKit(row) : null;
}

export async function listMediaKits(): Promise<MediaKitRecord[]> {
  if (!isDatabaseConfigured) return [];
  const rows = await db.select().from(mediakits).orderBy(desc(mediakits.updatedAt));
  return rows.map(rowToMediaKit);
}

export async function updateMediaKitStatus(kitId: string, status: MediaKitStatus): Promise<MediaKitRecord | null> {
  if (!isDatabaseConfigured) return null;
  if (!['draft', 'ready', 'sent', 'archived'].includes(status)) throw new Error('Estado de Media Kit inválido.');
  const [row] = await db.update(mediakits).set({ status, updatedAt: new Date() }).where(eq(mediakits.kitId, kitId)).returning();
  return row ? rowToMediaKit(row) : null;
}
