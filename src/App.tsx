/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Layout } from './components/layout/Layout';
import { PageTransition } from './components/layout/PageTransition';
import { SelectionProvider } from './context/SelectionContext';

// Public pages
import Home from './pages/Home';
import Inventario from './pages/Inventario';
import Soportes from './pages/Soportes';
import Nosotros from './pages/Nosotros';
import Soluciones from './pages/Soluciones';

// Auth & Dashboard
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import DashboardSoportes from './pages/dashboard/DashboardSoportes';
import DashboardMediaKits from './pages/dashboard/DashboardMediaKits';

function PublicRoutes() {
  const location = useLocation();
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/soportes" element={<PageTransition><Soportes /></PageTransition>} />
          <Route path="/nosotros" element={<PageTransition><Nosotros /></PageTransition>} />
          <Route path="/soluciones" element={<PageTransition><Soluciones /></PageTransition>} />
          <Route path="/inventario" element={<PageTransition><Inventario /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <SelectionProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/soportes" element={<DashboardSoportes />} />
          <Route path="/dashboard/mediakits" element={<DashboardMediaKits />} />
          <Route path="*" element={<PublicRoutes />} />
        </Routes>
      </Router>
    </SelectionProvider>
  );
}
