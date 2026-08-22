import { db, pool } from '../db';
import { mediakitRequests, mediakitRequestItems } from '../db/schema';
import { validateSupportsForRequest, getSupportByIdFromDB } from './supportsService';
import { eq, desc } from 'drizzle-orm';

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
  requestId: string;
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

    // 2. Validate selectedIds and availability against Database
    const validation = await validateSupportsForRequest(selectedIds);
    if (!validation.valid) {
      return {
        statusCode: validation.statusCode || 400,
        response: {
          status: 'error',
          message: validation.message || 'Error de validación de soportes.',
        },
      };
    }

    // 3. Generate unique, formatted Request ID (REQ-2026-XXXX-XXXX)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateSegment = new Date().getFullYear();
    // Count existing requests to get sequence number
    const existingReqs = await db.select().from(mediakitRequests);
    const seqNum = existingReqs.length + 1;
    const requestId = `REQ-${dateSegment}-${String(seqNum).padStart(4, '0')}-${randomSuffix}`;

    const createdAtStr = new Date().toISOString();

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

      for (const sId of selectedIds) {
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
          selectedCount: selectedIds.length,
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

    results.push({
      requestId: req.requestId,
      lead: {
        name: req.requesterName,
        email: req.requesterEmail,
        company: req.requesterCompany || '',
        phone: req.requesterPhone || '',
        message: req.message || '',
      },
      selectedIds,
      selectedSupports,
      createdAt: req.createdAt ? new Date(req.createdAt).toISOString() : new Date().toISOString(),
    });
  }

  return results;
}
