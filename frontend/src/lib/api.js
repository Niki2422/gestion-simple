// ============================================================
// api.js — Cliente Axios central + helper multi-consorcio
// ============================================================

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('consorcioActual');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Helper multi-consorcio ─────────────────────────────────
// Uso: apiConsorcio(cid).get('/unidades')
//      apiConsorcio(cid).post('/gastos', body)
// Arma automáticamente /consorcios/:cid/<lo que pongas>
export const apiConsorcio = (cid) => ({
  get:    (url, config)       => api.get(`/consorcios/${cid}${url}`, config),
  post:   (url, body, config) => api.post(`/consorcios/${cid}${url}`, body, config),
  put:    (url, body, config) => api.put(`/consorcios/${cid}${url}`, body, config),
  patch:  (url, body, config) => api.patch(`/consorcios/${cid}${url}`, body, config),
  delete: (url, config)       => api.delete(`/consorcios/${cid}${url}`, config),
});

export default api;