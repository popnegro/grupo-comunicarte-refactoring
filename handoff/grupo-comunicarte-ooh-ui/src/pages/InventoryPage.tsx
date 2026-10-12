import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { InventoryDrawer } from '../components/inventory/InventoryDrawer';
import { INITIAL_INVENTORY_FIXTURES } from '../fixtures/inventoryFixtures';
import { SupportItem } from '../types/inventory';

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<SupportItem[]>(INITIAL_INVENTORY_FIXTURES);
  const [selectedSupport, setSelectedSupport] = useState<SupportItem | null>(
    INITIAL_INVENTORY_FIXTURES[0] // SC-001 precargado para visualización idéntica al wireframe
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState<'lista' | 'mapa'>('lista');

  const handleEditSupport = (support: SupportItem) => {
    setSelectedSupport(support);
    setIsDrawerOpen(true);
  };

  const handleNewSupportClick = () => {
    // Abrir drawer con plantilla para nuevo soporte en modo UI presentacional según contrato
    const emptySupport: SupportItem = {
      id: `SC-${String(items.length + 1).padStart(3, '0')}`,
      nombre: '',
      tipo: 'Tradicional',
      direccion: '',
      localidad: 'Mendoza',
      codigoPostal: '5500',
      disponibilidad: 'Disponible',
      destacado: false,
      medidas: '8.00 x 4.00 m',
      formato: 'Cartel Frontlight',
      impactoMensual: '350.000 impactos/mes',
      caras: 1,
      estadoOperativo: 'Operativo',
      latitud: -32.8908,
      longitud: -68.8458,
      descripcion: '',
    };
    setSelectedSupport(emptySupport);
    setIsDrawerOpen(true);
  };

  const handleSavePresentational = (updated: SupportItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  return (
    <div>
      <PageHeader
        title="Inventario"
        subtitle="Gestioná y consultá todos los soportes publicitarios disponibles en el sistema."
      />

      <InventoryTable
        items={items}
        onEditSupport={handleEditSupport}
        onNewSupportClick={handleNewSupportClick}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <InventoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        support={selectedSupport}
        onSavePresentational={handleSavePresentational}
      />
    </div>
  );
};
