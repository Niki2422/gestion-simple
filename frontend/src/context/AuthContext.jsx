// ============================================================
// AuthContext.jsx  —  multi-consorcio
// Ubicación: src/context/AuthContext.jsx
//
// Agrega consorcioActual: el consorcio que el usuario eligió
// en ConsorciosPage. Persiste en localStorage para sobrevivir
// un refresh de página dentro de /consorcios/:cid/...
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario]                 = useState(null);
  const [consorcioActual, setConsorcioActualState] = useState(null);
  const [cargando, setCargando]               = useState(true);

  // Rehidratar sesión + consorcio activo desde localStorage
  useEffect(() => {
    const token             = localStorage.getItem('token');
    const usuarioGuardado   = localStorage.getItem('usuario');
    const consorcioGuardado = localStorage.getItem('consorcioActual');

    if (token && usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
        if (consorcioGuardado) {
          setConsorcioActualState(JSON.parse(consorcioGuardado));
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('consorcioActual');
      }
    }
    setCargando(false);
  }, []);

  const login = async (email, contrasena) => {
    const { data } = await api.post('/auth/login', { email, contrasena });
    const { token, usuario: u } = data.datos;
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(u));
    setUsuario(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('consorcioActual');
    setUsuario(null);
    setConsorcioActualState(null);
  };

  // Guarda el consorcio elegido (objeto con id, nombre, mi_rol)
  const setConsorcioActual = (consorcio) => {
    localStorage.setItem('consorcioActual', JSON.stringify(consorcio));
    setConsorcioActualState(consorcio);
  };

  // Limpia el consorcio activo (ej: al volver al selector)
  const salirDeConsorcio = () => {
    localStorage.removeItem('consorcioActual');
    setConsorcioActualState(null);
  };

  return (
    <AuthContext.Provider value={{
      usuario, cargando, login, logout,
      consorcioActual, setConsorcioActual, salirDeConsorcio,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};