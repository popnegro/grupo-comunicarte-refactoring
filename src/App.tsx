import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
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
import ProtectedRoute from './components/auth/ProtectedRoute';

const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const DashboardSupportList = lazy(() => import('./pages/dashboard/DashboardSupportList'));
const DashboardSupportProductEditorConnected = lazy(() => import('./pages/dashboard/DashboardSupportProductEditorConnected'));
const DashboardSupportPreview = lazy(() => import('./pages/dashboard/DashboardSupportPreview'));
const DashboardSupportReservation = lazy(() => import('./pages/dashboard/DashboardSupportReservation'));
const DashboardMediaKitWorkflow = lazy(() => import('./pages/dashboard/DashboardMediaKitWorkflow'));
const DashboardMediaKitBuilder = lazy(() => import('./pages/dashboard/DashboardMediaKitBuilder'));

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
        <Suspense fallback={<div className="min-h-screen bg-[#F9F9F9] px-6 py-20 text-center text-sm text-gray-500">Cargando…</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/soportes" element={<ProtectedRoute><DashboardSupportList /></ProtectedRoute>} />
            <Route path="/dashboard/soportes/new" element={<ProtectedRoute><DashboardSupportProductEditorConnected mode="create" /></ProtectedRoute>} />
            <Route path="/dashboard/soportes/:canonicalId/edit" element={<ProtectedRoute><DashboardSupportProductEditorConnected mode="edit" /></ProtectedRoute>} />
            <Route path="/dashboard/soportes/:canonicalId/preview" element={<ProtectedRoute><DashboardSupportPreview /></ProtectedRoute>} />
            <Route path="/dashboard/soportes/:canonicalId/reservation" element={<ProtectedRoute><DashboardSupportReservation /></ProtectedRoute>} />
            <Route path="/dashboard/solicitudes" element={<ProtectedRoute><DashboardMediaKitWorkflow /></ProtectedRoute>} />
            <Route path="/dashboard/mediakits/nuevo" element={<ProtectedRoute><DashboardMediaKitBuilder /></ProtectedRoute>} />
            <Route path="/dashboard/mediakits" element={<ProtectedRoute><DashboardMediaKitWorkflow /></ProtectedRoute>} />
            <Route path="*" element={<PublicRoutes />} />
          </Routes>
        </Suspense>
      </Router>
    </SelectionProvider>
  );
}
