import React, { useState } from 'react';
import { AppSidebar, DashboardRoute } from './AppSidebar';
import { AppHeader } from './AppHeader';

interface AppLayoutProps {
  currentRoute: DashboardRoute;
  onRouteChange: (route: DashboardRoute) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentRoute,
  onRouteChange,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Sidebar fijo */}
      <AppSidebar
        currentRoute={currentRoute}
        onRouteChange={onRouteChange}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Contenedor principal ajustado según el ancho del sidebar */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <AppHeader
          onToggleMobileSidebar={() => setIsMobileOpen(true)}
          unreadNotificationsCount={1}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
