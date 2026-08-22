import { fixedLocations, mobileRoutes } from '../data/inventory';
import { getDisponibilidad, InventoryItem } from '../types';

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

// In-memory lead repository for PMV
const leadsStore: MediakitRecord[] = [];

/**
 * Validates lead request and processes submission against inventory rules.
 */
export function handleMediakitRequest(body: any): {
  statusCode: number;
  response: {
    status: 'success' | 'error';
    requestId?: string;
    message: string;
    data?: any;
  };
} {
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

    // 2. Validate selectedIds
    if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
      return {
        statusCode: 400,
        response: {
          status: 'error',
          message: 'Debes seleccionar al menos un soporte para solicitar el Media Kit.',
        },
      };
    }

    // 3. Security Rule: Verify against real inventory and exclude 'reservado'
    const allInventory: InventoryItem[] = [...fixedLocations, ...mobileRoutes];
    const inventoryMap = new Map<string, InventoryItem>();
    for (const item of allInventory) {
      inventoryMap.set(item.canonical_id, item);
    }

    const matchedSupports: InventoryItem[] = [];
    for (const id of selectedIds) {
      if (typeof id !== 'string') {
        return {
          statusCode: 400,
          response: {
            status: 'error',
            message: `Identificador de soporte inválido: ${String(id)}`,
          },
        };
      }

      const item = inventoryMap.get(id);
      if (!item) {
        return {
          statusCode: 400,
          response: {
            status: 'error',
            message: `El soporte con ID '${id}' no existe en el catálogo.`,
          },
        };
      }

      if (getDisponibilidad(item) === 'reservado') {
        return {
          statusCode: 400,
          response: {
            status: 'error',
            message: `El soporte '${item.name}' está actualmente reservado y no puede incluirse en el Media Kit.`,
          },
        };
      }

      matchedSupports.push(item);
    }

    // 4. Generate unique, formatted Request ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateSegment = new Date().getFullYear();
    const requestId = `REQ-${dateSegment}-${String(leadsStore.length + 1).padStart(4, '0')}-${randomSuffix}`;

    const newRecord: MediakitRecord = {
      requestId,
      lead: {
        name,
        email,
        company: typeof lead.company === 'string' ? lead.company.trim() : '',
        phone: typeof lead.phone === 'string' ? lead.phone.trim() : '',
        message: typeof lead.message === 'string' ? lead.message.trim() : '',
      },
      selectedIds,
      selectedSupports: matchedSupports.map((s) => ({
        canonical_id: s.canonical_id,
        name: s.name,
        ciudad: s.ciudad,
        tipo_soporte: s.tipo_soporte,
      })),
      createdAt: new Date().toISOString(),
    };

    leadsStore.push(newRecord);

    return {
      statusCode: 201,
      response: {
        status: 'success',
        requestId,
        message: 'Solicitud de Media Kit registrada exitosamente.',
        data: {
          requestId,
          selectedCount: selectedIds.length,
          createdAt: newRecord.createdAt,
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

export function getAllMediakitRequests(): MediakitRecord[] {
  return [...leadsStore];
}
