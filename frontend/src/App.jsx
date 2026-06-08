// ============================================================
// App.jsx — Router principal
// Ubicación: src/App.jsx
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import RutaProtegida     from './components/RutaProtegida';
import LoginPage         from './pages/LoginPage';
import DashboardPage     from './pages/DashboardPage';
import PeriodosPage      from './pages/PeriodosPage';
import GastosPage        from './pages/GastosPage';
import UnidadesPage      from './pages/UnidadesPage';
import ExpensasPage      from './pages/ExpensasPage';
import UsuariosPage      from './pages/UsuariosPage';
import NotFoundPage      from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protegidas */}
          <Route path="/dashboard" element={
            <RutaProtegida><DashboardPage /></RutaProtegida>
          } />
          <Route path="/periodos" element={
            <RutaProtegida><PeriodosPage /></RutaProtegida>
          } />
          <Route path="/unidades" element={
            <RutaProtegida><UnidadesPage /></RutaProtegida>
          } />
          <Route path="/gastos" element={
            <RutaProtegida><GastosPage /></RutaProtegida>
          } />
          <Route path="/expensas" element={
            <RutaProtegida><ExpensasPage /></RutaProtegida>
          } />
          <Route path="/usuarios" element={
            <RutaProtegida roles={['administrador']}><UsuariosPage /></RutaProtegida>
          } />

          {/* Raíz → dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 — cualquier ruta no definida */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}