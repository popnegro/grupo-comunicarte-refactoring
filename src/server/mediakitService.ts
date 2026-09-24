import { db, pool, isDatabaseConfigured } from '../db/index.ts';
import { mediakitRequests, mediakitRequestItems } from '../db/schema.ts';
import { validateSupportsForRequest, getSupportByIdFromDB } from './supportsService.ts';
import { eq, desc } from 'drizzle-orm';

const inMemoryRequests: MediakitRecord[] = [];

export interface LeadPayload {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
}

export interface MediakitRequestBody {
  lead: LeadPayload;
  selectedIds: string[];
}

export interface MediakitRecord {
  id: string;
  requestId: string;
  requesterName: string;
  requesterEmail: string;
  requesterCompany: string;
  requesterPhone: string;
  message: string;
  status: string;
  supportIds: string[];
  supportNames: string[];
  lead: {
    name: string;
    email: string;
    company: string;
    phone: string;
    message: string;
  };
  selectedIds: string[];
  selectedSupports: {
    canonical_id: string;
    name: string;
    ciudad: string;
    tipo_soporte: string;
  }[];
  createdAt: string;
}

/**
 * Handles Media Kit request submission with DB transaction and validation.
 */
export async function handleMediakitRequest(body: any): Promise<{
  statusCode: number;
  response: {
    status: 'success' | 'error';
    requestId?: string;
    message: string;
    data?: any;
  };
}> {
  try {
    if (!body || typeof body !== 'object') {
      return {
        statusCode: 400,
        response: {
          status: 'error',
          message: 'Cuerpo de solicitud inválido o vacío.',
        },
      };
    }

    const { lead, selectedIds } = body as MediakitRequestBody;

    // Deduplicate selectedIds (P1-2)
    const uniqueSelectedIds = Array.from(new Set((selectedIds || []).filter((id): id is string => typeof id === 'string' && id.trim().length > 0)));

    // 1. Validate Lead data
    if (!lead || typeof lead !== 'object') {
      return {
        statusCode: 400,
        response: {
          status: 'error',
          message: 'Los datos de contacto (lead) son obligatorios.',
        },
      };
    }

    const name = typeof lead.name === 'string' ? lead.name.trim() : '';
    if (!name || name.length < 2) {
      return {
        statusCode: 400,
        response: {
          status: 'error',
          message: 'El nombre es obligatorio y debe tener al menos 2 caracteres.',
        },
      };
    }

    const email = typeof lead.email === 'string' ? lead.email.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        statusCode: 400,
        response: {
          status: 'error',
          message: 'El formato de correo electrónico ingresado no es válido.',
        },
      };
    }

    // 2. Validate uniqueSelectedIds and availability against Database
    const validation = await validateSupportsForRequest(uniqueSelectedIds);
    if (!validation.valid) {
      return {
        statusCode: validation.statusCode || 400,
        response: {
          status: 'error',
          message: validation.message || 'Error de validación de soportes.',
        },
      };
    }

    // 3. Generate concurrent-safe unique Request ID (REQ-2026-XXXX-XXXX) (P1-1)
    let requestId = '';
    let attempts = 0;
    while (attempts < 5) {
      attempts++;
      const r1 = Math.floor(1000 + Math.random() * 9000);
      const r2 = Math.floor(1000 + Math.random() * 9000);
      const candidate = `REQ-${new Date().getFullYear()}-${r1}-${r2}`;
      if (isDatabaseConfigured) {
        try {
          const found = await db.select().from(mediakitRequests).where(eq(mediakitRequests.requestId, candidate));
          if (found.length === 0) {
            requestId = candidate;
            break;
          }
        } catch {
          requestId = candidate;
          break;
        }
      } else {
        if (!inMemoryRequests.some((r) => r.requestId === candidate)) {
          requestId = candidate;
          break;
        }
      }
    }
    if (!requestId) {
      requestId = `REQ-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const createdAtStr = new Date().toISOString();

    if (!isDatabaseConfigured) {
      const createdRecord: MediakitRecord = {
        id: requestId,
        requestId,
        requesterName: name,
        requesterEmail: email,
        requesterCompany: typeof lead.company === 'string' ? lead.company.trim() : '',
        requesterPhone: typeof lead.phone === 'string' ? lead.phone.trim() : '',
        message: typeof lead.message === 'string' ? lead.message.trim() : '',
        status: 'pending',
        supportIds: uniqueSelectedIds,
        supportNames: (validation.matchedSupports || []).map((s) => s.name),
        lead: {
          name,
          email,
          company: typeof lead.company === 'string' ? lead.company.trim() : '',
          phone: typeof lead.phone === 'string' ? lead.phone.trim() : '',
          message: typeof lead.message === 'string' ? lead.message.trim() : '',
        },
        selectedIds: uniqueSelectedIds,
        selectedSupports: (validation.matchedSupports || []).map((sup) => ({
          canonical_id: sup.canonical_id,
          name: sup.name,
          ciudad: sup.ciudad,
          tipo_soporte: sup.tipo_soporte,
        })),
        createdAt: createdAtStr,
      };
      inMemoryRequests.unshift(createdRecord);

      return {
        statusCode: 201,
        response: {
          status: 'success',
          requestId,
          message: 'Solicitud de Media Kit registrada exitosamente.',
          data: {
            requestId,
            selectedCount: uniqueSelectedIds.length,
            createdAt: createdAtStr,
          },
        },
      };
    }

    // 4. Atomic Transaction: Insert Request and Items
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO mediakit_requests (request_id, requester_name, requester_email, requester_company, requester_phone, message, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          requestId,
          name,
          email,
          typeof lead.company === 'string' ? lead.company.trim() : '',
          typeof lead.phone === 'string' ? lead.phone.trim() : '',
          typeof lead.message === 'string' ? lead.message.trim() : '',
          'pending',
        ]
      );

      for (const sId of uniqueSelectedIds) {
        await client.query(
          `INSERT INTO mediakit_request_items (request_id, support_id) VALUES ($1, $2)`,
          [requestId, sId]
        );
      }

      await client.query('COMMIT');
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }

    return {
      statusCode: 201,
      response: {
        status: 'success',
        requestId,
        message: 'Solicitud de Media Kit registrada exitosamente.',
        data: {
          requestId,
          selectedCount: uniqueSelectedIds.length,
          createdAt: createdAtStr,
        },
      },
    };
  } catch (err: any) {
    console.error('Error procesando solicitud de Media Kit:', err);
    return {
      statusCode: 500,
      response: {
        status: 'error',
        message: 'Ocurrió un error interno al procesar tu solicitud. Intenta nuevamente.',
      },
    };
  }
}

export async function getAllMediakitRequestsFromDB(): Promise<MediakitRecord[]> {
  if (!isDatabaseConfigured) {
    return inMemoryRequests;
  }
  try {
    const reqRows = await db.select().from(mediakitRequests).orderBy(desc(mediakitRequests.createdAt));
    const results: MediakitRecord[] = [];

    for (const req of reqRows) {
      const itemRows = await db
        .select()
        .from(mediakitRequestItems)
        .where(eq(mediakitRequestItems.requestId, req.requestId));

      const selectedIds = itemRows.map((i) => i.supportId);
      const selectedSupports = [];

      for (const sId of selectedIds) {
        const sup = await getSupportByIdFromDB(sId);
        if (sup) {
          selectedSupports.push({
            canonical_id: sup.canonical_id,
            name: sup.name,
            ciudad: sup.ciudad,
            tipo_soporte: sup.tipo_soporte,
          });
        }
      }

      const requesterCompany = req.requesterCompany || '';
      const requesterPhone = req.requesterPhone || '';
      const message = req.message || '';
      const status = req.status || 'pending';
      const supportNames = selectedSupports.map((support) => support.name);
      const createdAt = req.createdAt ? new Date(req.createdAt).toISOString() : new Date().toISOString();

      results.push({
        id: req.requestId,
        requestId: req.requestId,
        requesterName: req.requesterName,
        requesterEmail: req.requesterEmail,
        requesterCompany: requesterCompany,
        requesterPhone: requesterPhone,
        message,
        status,
        supportIds: selectedIds,
        supportNames,
        lead: {
          name: req.requesterName,
          email: req.requesterEmail,
          company: requesterCompany,
          phone: requesterPhone,
          message,
        },
        selectedIds,
        selectedSupports,
        createdAt,
      });
    }

    return results;
  } catch (err) {
    console.warn('Falling back to in-memory mediakit requests due to DB error:', err);
    return inMemoryRequests;
  }
}
