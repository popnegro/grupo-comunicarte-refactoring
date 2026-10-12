/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardRoute } from './components/layout/AppSidebar';
import { InventoryPage } from './pages/InventoryPage';
import { MediaKitsPage } from './pages/MediaKitsPage';
import { PendingPage } from './pages/PendingPage';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<DashboardRoute>('inventario');

  const renderContent = () => {
    switch (currentRoute) {
      case 'inventario':
        return <InventoryPage />;
      case 'solicitudes-media-kits':
        return <MediaKitsPage />;
      default:
        return (
          <PendingPage
            routeName={currentRoute}
            onNavigateToInventory={() => setCurrentRoute('inventario')}
          />
        );
    }
  };

  return (
    <AppLayout currentRoute={currentRoute} onRouteChange={setCurrentRoute}>
      {renderContent()}
    </AppLayout>
  );
}
