import { createContext, useContext, useEffect, useState } from 'react';
import { api, token } from '../lib/client.js';
import { toast } from '../lib/ui.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

/** Guarda al usuario de la sesión y lo comparte con toda la aplicación. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token.get())); // si hay token, primero validamos la sesión

  useEffect(() => {
    if (!token.get()) return;
    api.auth.me().then(setUser).catch(() => token.clear()).finally(() => setLoading(false));
  }, []);

  // Si el servidor responde 401 (token vencido), se cierra la sesión y se avisa al usuario.
  useEffect(() => {
    const onExpired = () => { setUser(null); toast('Tu sesión venció. Ingresa de nuevo.', 'err'); };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const startSession = ({ token: t, user: u }) => { token.set(t); setUser(u); return u; };

  const value = {
    user, loading, setUser,
    login: async (data) => startSession(await api.auth.login(data)),
    register: async (data) => startSession(await api.auth.register(data)),
    logout: () => { token.clear(); setUser(null); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
