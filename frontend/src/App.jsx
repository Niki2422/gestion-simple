// ============================================================
// App.jsx  —  multi-consorcio
// Ubicación: src/App.jsx
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }    from './context/AuthContext';
import RutaProtegida       from './components/RutaProtegida';
import LoginPage           from './pages/LoginPage';
import ConsorciosPage      from './pages/ConsorciosPage';
import DashboardPage       from './pages/DashboardPage';
import PeriodosPage        from './pages/PeriodosPage';
import GastosPage          from './pages/GastosPage';
import UnidadesPage        from './pages/UnidadesPage';
import ExpensasPage        from './pages/ExpensasPage';
import UsuariosPage        from './pages/UsuariosPage';
import PresupuestosPage    from './pages/PresupuestosPage';
import NotFoundPage        from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Selector de consorcios — requiere sesión, no requiere :cid */}
          <Route path="/consorcios" element={
            <RutaProtegida><ConsorciosPage /></RutaProtegida>
          } />

          {/* Rutas con scope de consorcio */}
          <Route path="/consorcios/:cid/dashboard" element={
            <RutaProtegida><DashboardPage /></RutaProtegida>
          } />
          <Route path="/consorcios/:cid/periodos" element={
            <RutaProtegida><PeriodosPage /></RutaProtegida>
          } />
          <Route path="/consorcios/:cid/unidades" element={
            <RutaProtegida><UnidadesPage /></RutaProtegida>
          } />
          <Route path="/consorcios/:cid/gastos" element={
            <RutaProtegida><GastosPage /></RutaProtegida>
          } />
          <Route path="/consorcios/:cid/expensas" element={
            <RutaProtegida><ExpensasPage /></RutaProtegida>
          } />
          <Route path="/consorcios/:cid/presupuestos" element={
            <RutaProtegida><PresupuestosPage /></RutaProtegida>
          } />
          <Route path="/consorcios/:cid/usuarios" element={
            <RutaProtegida rolesPlataforma={['administrador']}><UsuariosPage /></RutaProtegida>
          } />

          {/* Raíz → selector de consorcios */}
          <Route path="/" element={<Navigate to="/consorcios" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}