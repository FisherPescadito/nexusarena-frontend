import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Layout, Protected } from './components/Layout.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import Home from './pages/Home.jsx';
import { Login, Register } from './pages/Auth.jsx';
import Profile from './pages/Profile.jsx';
import TeamHistory from './pages/TeamHistory.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tournaments from './pages/Tournaments.jsx';
import TournamentDetail from './pages/TournamentDetail.jsx';
import Teams from './pages/Teams.jsx';
import './styles.css';

const NotFound = () => (
  <section className="panel"><h1>Página no encontrada</h1><Link to="/">Volver al inicio</Link></section>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="registro" element={<Register />} />
              <Route path="dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="torneos" element={<Protected><Tournaments /></Protected>} />
              <Route path="torneos/:id" element={<Protected><TournamentDetail /></Protected>} />
              <Route path="equipos" element={<Protected roles={['player']}><Teams /></Protected>} />
              <Route path="equipos/:id/historial" element={<Protected roles={['player']}><TeamHistory /></Protected>} />
              <Route path="perfil" element={<Protected><Profile /></Protected>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
