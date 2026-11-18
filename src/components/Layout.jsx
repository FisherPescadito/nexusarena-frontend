import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../lib/constants.js';
import { toast } from '../lib/ui.js';

export function Layout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Al cambiar de pantalla el foco vuelve al contenido (ayuda a quienes navegan con teclado o lector de pantalla)
  useEffect(() => { document.getElementById('app')?.focus(); }, [pathname]);

  return (
    <>
      <a className="skip" href="#app">Saltar al contenido</a>
      <header className="top">
        <Link className="brand" to="/">Nexus<span>Arena</span></Link>
        <button className="menu-btn btn ghost" aria-expanded={menuOpen} aria-controls="nav" onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? 'Cerrar menú' : 'Menú'}
        </button>
        <nav id="nav" className={menuOpen ? 'open' : ''} aria-label="Principal" onClick={() => setMenuOpen(false)}>
          <ul>
            <li><NavLink to="/" end>Inicio</NavLink></li>
            {user && <li><NavLink to="/dashboard">Dashboard</NavLink></li>}
            {user && <li><NavLink to="/torneos">Torneos</NavLink></li>}
            {user?.role === 'player' && <li><NavLink to="/equipos">Mis equipos</NavLink></li>}
            {user && <li><NavLink to="/perfil">Perfil</NavLink></li>}
          </ul>
          <div className="session">
            {user ? (
              <>
                <span>{user.nick} <em>{ROLES[user.role]}</em></span>
                <button className="btn ghost" onClick={() => { logout(); toast('Sesión cerrada'); }}>Salir</button>
              </>
            ) : (
              <>
                <Link className="btn ghost" to="/login">Ingresar</Link>
                <Link className="btn" to="/registro">Crear cuenta</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main id="app" tabIndex={-1}><Outlet /></main>
      <footer>NexusArena · Proyecto final JavaScript Avanzado · Sprint 4</footer>
    </>
  );
}

/** Guarda de rutas: exige sesión y, opcionalmente, un rol. */
export function Protected({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="empty">Cargando…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
