import { fixedLocations, mobileRoutes } from '../data/inventory';
import { InventoryItem, Disponibilidad } from '../types';

export interface DashboardLead {
  id: string;
  requestId: string;
  clientName: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  supportIds: string[];
  supportNames: string[];
  plazas: string[];
  status: 'nuevo' | 'contactado' | 'enviado' | 'cerrado';
  createdAt: string;
  estimatedBudget?: string;
}

// Initial realistic demo leads for Grupo Comunicarte
const INITIAL_DEMO_LEADS: DashboardLead[] = [
  {
    id: 'lead-001',
    requestId: 'REQ-2026-0042-8821',
    clientName: 'Martina Benítez',
    company: 'Agencia Havas Buenos Aires',
    email: 'm.benitez@havas.com.ar',
    phone: '+54 9 11 4829-1100',
    message: 'Campaña Primavera para cliente fintech. Necesitamos cotización por 3 meses para Pantallas LED y circuitos móviles.',
    supportIds: ['bue-led-04', 'mza-trad-01', 'mza-mob-01'],
    supportNames: ['Av. San Juan 1981 (LED)', 'Cartel Nudo Vial', 'Camión LED Móvil Centro'],
    plazas: ['Buenos Aires', 'Mendoza'],
    status: 'nuevo',
    createdAt: '2026-08-20T08:15:00.000Z',
    estimatedBudget: '$ 4.800.000 / mes',
  },
  {
    id: 'lead-002',
    requestId: 'REQ-2026-0041-3312',
    clientName: 'Santiago Rossi',
    company: 'Cervecería & Maltería Quilmes',
    email: 'santiago.rossi@ab-inbev.com',
    phone: '+54 9 11 5521-9988',
    message: 'Lanzamiento nueva variedad Patagonia. Interesa circuito de alto impacto en Nudo Vial Mendoza y 9 de Julio.',
    supportIds: ['mza-trad-01', 'mza-trad-02'],
    supportNames: ['Cartel Nudo Vial', 'Soporte Arístides'],
    plazas: ['Mendoza'],
    status: 'enviado',
    createdAt: '2026-08-19T17:40:00.000Z',
    estimatedBudget: '$ 3.200.000 / mes',
  },
  {
    id: 'lead-003',
    requestId: 'REQ-2026-0040-7719',
    clientName: 'Lucía Fernández',
    company: 'Mercado Libre Publicidad',
    email: 'lucia.fernandez@mercadolibre.com',
    phone: '+54 9 11 3344-7711',
    message: 'Buscamos presencia en corredores gastronómicos de Mendoza para Mercado Pago.',
    supportIds: ['mza-trad-02', 'mza-led-01'],
    supportNames: ['Soporte Arístides', 'Pantalla Centro Peatonal'],
    plazas: ['Mendoza'],
    status: 'contactado',
    createdAt: '2026-08-18T14:10:00.000Z',
    estimatedBudget: '$ 2.500.000 / mes',
  },
  {
    id: 'lead-004',
    requestId: 'REQ-2026-0039-1054',
    clientName: 'Gonzalo Morales',
    company: 'Bodegas Bianchi',
    email: 'gmorales@bodegasbianchi.com.ar',
    phone: '+54 9 261 423-9900',
    message: 'Reserva para temporada de Vendimia 2027 en accesos clave a la Ciudad de Mendoza.',
    supportIds: ['mza-trad-01', 'mza-trad-04', 'mza-mob-01'],
    supportNames: ['Cartel Nudo Vial', 'Acceso Este km 10', 'Camión LED Móvil Centro'],
    plazas: ['Mendoza'],
    status: 'cerrado',
    createdAt: '2026-08-16T11:25:00.000Z',
    estimatedBudget: '$ 5.100.000 / mes',
  },
];

export const LEADS_STORAGE_KEY = 'grupocomunicarte:dashboard-leads';
export const INVENTORY_OVERRIDE_KEY = 'grupocomunicarte:inventory-overrides';

const LEADS_CHANGE_EVENT = 'grupocomunicarte:leads-changed';

export function subscribeToLeads(callback: (leads: DashboardLead[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === LEADS_STORAGE_KEY) {
      callback(getStoredLeads());
    }
  };

  const handleCustom = () => {
    callback(getStoredLeads());
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(LEADS_CHANGE_EVENT, handleCustom);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(LEADS_CHANGE_EVENT, handleCustom);
  };
}

export function getStoredLeads(): DashboardLead[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_LEADS;
  try {
    const raw = window.localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_LEADS));
      return INITIAL_DEMO_LEADS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_LEADS;
  }
}

export function saveStoredLeads(leads: DashboardLead[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    window.dispatchEvent(new CustomEvent(LEADS_CHANGE_EVENT));
  } catch {
    // ignore
  }
}

export function updateLeadStatus(leadId: string, newStatus: DashboardLead['status']): DashboardLead[] {
  const current = getStoredLeads();
  const updated = current.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l));
  saveStoredLeads(updated);
  return updated;
}

export function recordNewLead(data: {
  requestId: string;
  clientName: string;
  company?: string;
  email: string;
  phone?: string;
  message?: string;
  supportIds: string[];
  supportNames: string[];
  plazas: string[];
}): DashboardLead {
  const current = getStoredLeads();
  const newLead: DashboardLead = {
    id: `lead-${Date.now()}`,
    requestId: data.requestId,
    clientName: data.clientName,
    company: data.company || '',
    email: data.email,
    phone: data.phone || '',
    message: data.message || '',
    supportIds: data.supportIds,
    supportNames: data.supportNames,
    plazas: data.plazas,
    status: 'nuevo',
    createdAt: new Date().toISOString(),
    estimatedBudget: 'A cotizar',
  };
  const updated = [newLead, ...current];
  saveStoredLeads(updated);
  return newLead;
}

export function getInventoryOverrides(): Record<string, Disponibilidad> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(INVENTORY_OVERRIDE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setInventoryOverride(canonicalId: string, disponibilidad: Disponibilidad): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getInventoryOverrides();
    current[canonicalId] = disponibilidad;
    window.localStorage.setItem(INVENTORY_OVERRIDE_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

export function getMergedInventory(): InventoryItem[] {
  const base: InventoryItem[] = [...fixedLocations, ...mobileRoutes];
  const overrides = getInventoryOverrides();

  return base.map((item) => {
    if (overrides[item.canonical_id]) {
      return {
        ...item,
        disponibilidad: overrides[item.canonical_id],
      };
    }
    return item;
  });
}
