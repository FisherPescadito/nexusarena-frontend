// Cliente de NUESTRA API (backend Express). Todas las pantallas hablan con el servidor a través de este archivo.
import { BusinessError } from './errors.js';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// El token (JWT) que devuelve el login se guarda en el navegador y se envía en cada petición.
export const token = {
  get: () => localStorage.getItem('nexusarena:token'),
  set: (t) => localStorage.setItem('nexusarena:token', t),
  clear: () => localStorage.removeItem('nexusarena:token'),
};

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token.get() && { Authorization: `Bearer ${token.get()}` }) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new BusinessError('No se pudo conectar con el servidor. Inténtalo de nuevo en unos segundos.');
  }
  // Sesión vencida: se limpia el token y se avisa a la app (ver AuthContext)
  if (res.status === 401 && token.get() && !path.startsWith('/auth/')) {
    token.clear();
    window.dispatchEvent(new Event('auth:expired'));
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new BusinessError(data.message ?? 'Error inesperado', data.errors ?? {});
  return data;
}

export const api = {
  stats: () => request('GET', '/stats'),
  dashboard: () => request('GET', '/dashboard'),
  auth: {
    register: (data) => request('POST', '/auth/register', data),
    login: (data) => request('POST', '/auth/login', data),
    me: () => request('GET', '/auth/me'),
  },
  users: {
    update: (data) => request('PUT', '/users/me', data),
    setPick: (game, pick) => request('PUT', `/users/me/picks/${game}`, pick),
  },
  tournaments: {
    list: (game = '') => request('GET', `/tournaments${game ? `?game=${game}` : ''}`),
    get: (id) => request('GET', `/tournaments/${id}`),
    setStatus: (id, status) => request('PATCH', `/tournaments/${id}/status`, { status }),
    generateBracket: (id) => request('POST', `/tournaments/${id}/bracket`),
    saveResult: (id, matchId, score1, score2) => request('PUT', `/tournaments/${id}/matches/${matchId}`, { score1, score2 }),
    create: (data) => request('POST', '/tournaments', data),
    update: (id, data) => request('PUT', `/tournaments/${id}`, data),
    remove: (id) => request('DELETE', `/tournaments/${id}`),
    register: (id, teamId) => request('POST', `/tournaments/${id}/registrations`, { teamId }),
    cancel: (id, regId) => request('DELETE', `/tournaments/${id}/registrations/${regId}`),
  },
  teams: {
    list: () => request('GET', '/teams'),
    create: (data) => request('POST', '/teams', data),
    update: (id, data) => request('PUT', `/teams/${id}`, data),
    remove: (id) => request('DELETE', `/teams/${id}`),
    addMember: (id, email) => request('POST', `/teams/${id}/members`, { email }),
    history: (id) => request('GET', `/teams/${id}/history`),
    removeMember: (id, userId) => request('DELETE', `/teams/${id}/members/${userId}`),
  },
};
