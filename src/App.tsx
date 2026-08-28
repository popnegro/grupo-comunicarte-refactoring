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
import Contacto from './pages/Contacto';

// Auth & Dashboard
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import DashboardSoportes from './pages/dashboard/DashboardSoportes';
import DashboardSupportList from './pages/dashboard/DashboardSupportList';
import DashboardSupportThemedEditorV2 from './pages/dashboard/DashboardSupportThemedEditorV2';
import DashboardSupportPreview from './pages/dashboard/DashboardSupportPreview';
import DashboardSupportReservation from './pages/dashboard/DashboardSupportReservation';
import DashboardMediaKitWorkflow from './pages/dashboard/DashboardMediaKitWorkflow';

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
          <Route path="/contacto" element={<PageTransition><Contacto /></PageTransition>} />
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
          <Route path="/dashboard/soportes" element={<DashboardSupportList />} />
          <Route path="/dashboard/soportes/new" element={<DashboardSupportThemedEditorV2 mode="create" />} />
          <Route path="/dashboard/soportes/:canonicalId/edit" element={<DashboardSupportThemedEditorV2 mode="edit" />} />
          <Route path="/dashboard/soportes/:canonicalId/preview" element={<DashboardSupportPreview />} />
          <Route path="/dashboard/soportes/:canonicalId/reservation" element={<DashboardSupportReservation />} />
          <Route path="/dashboard/soportes/advanced" element={<DashboardSoportes />} />
          <Route path="/dashboard/solicitudes" element={<DashboardMediaKitWorkflow />} />
          <Route path="/dashboard/mediakits" element={<DashboardMediaKitWorkflow />} />
          <Route path="*" element={<PublicRoutes />} />
        </Routes>
      </Router>
    </SelectionProvider>
  );
}
