import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { MediaKitsTable } from '../components/mediaKits/MediaKitsTable';
import { MediaKitsDrawer } from '../components/mediaKits/MediaKitsDrawer';
import { INITIAL_MEDIA_KIT_FIXTURES } from '../fixtures/mediaKitsFixtures';
import { INITIAL_INVENTORY_FIXTURES } from '../fixtures/inventoryFixtures';
import { MediaKitRequestItem, MediaKitStatus } from '../types/mediaKits';

export const MediaKitsPage: React.FC = () => {
  const [items, setItems] = useState<MediaKitRequestItem[]>(INITIAL_MEDIA_KIT_FIXTURES);
  const [selectedRequest, setSelectedRequest] = useState<MediaKitRequestItem | null>(
    INITIAL_MEDIA_KIT_FIXTURES[0] // MK-001 precargado con soportes como en wireframe
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState<'lista' | 'mapa'>('lista');

  const handleRequestClick = (request: MediaKitRequestItem) => {
    setSelectedRequest(request);
    setIsDrawerOpen(true);
  };

  const handleNewRequestClick = () => {
    const emptyRequest: MediaKitRequestItem = {
      id: `MK-${String(items.length + 1).padStart(3, '0')}`,
      cliente: 'Nuevo Anunciante',
      clienteEmail: 'contacto@anunciante.com',
      campana: 'Campaña Nueva',
      campanaTipo: 'Comercial',
      mediaKit: 'Kit Gran Formato',
      mediaKitDetalle: 'Propuesta a medida',
      fechaSolicitud: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
      descripcion: 'Solicitud comercial inicial en elaboración.',
      solicitante: 'Equipo de Cuentas',
      solicitanteEmail: 'ventas@grupocomunicarte.com',
      soportes: [],
      periodo: {
        duracionUnidad: 'días',
      },
      monto: {
        moneda: 'ARS',
      },
    };
    setSelectedRequest(emptyRequest);
    setIsDrawerOpen(true);
  };

  const handleSavePresentational = (updated: MediaKitRequestItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    setSelectedRequest(updated);
  };

  const handleStatusChangePresentational = (id: string, newStatus: MediaKitStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, estado: newStatus } : item))
    );
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest((prev) => (prev ? { ...prev, estado: newStatus } : null));
    }
  };

  return (
    <div>
      <PageHeader
        title="Solicitudes de Media Kits"
        subtitle="Gestioná las solicitudes comerciales, configurá los soportes y definí los períodos y montos de las propuestas."
      />

      <MediaKitsTable
        items={items}
        onRequestClick={handleRequestClick}
        onNewRequestClick={handleNewRequestClick}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <MediaKitsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        request={selectedRequest}
        onSavePresentational={handleSavePresentational}
        onStatusChangePresentational={handleStatusChangePresentational}
        availableSupports={INITIAL_INVENTORY_FIXTURES}
      />
    </div>
  );
};
