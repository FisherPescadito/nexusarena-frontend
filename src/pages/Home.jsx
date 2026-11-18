import { Link } from 'react-router-dom';
import { api } from '../lib/client.js';
import { useApi } from '../lib/hooks.js';
import { useAuth } from '../context/AuthContext.jsx';

const LABELS = { users: 'Usuarios', teams: 'Equipos', tournaments: 'Torneos', registrations: 'Inscripciones' };

export default function Home() {
  const { user } = useAuth();
  const { data: stats } = useApi(api.stats);
  return (
    <>
      <section className="hero">
        <h1>Tu torneo universitario, sin hojas de cálculo.</h1>
        <p>Inscribe equipos, controla cupos y publica resultados de League of Legends y Valorant desde un solo lugar.</p>
        <div className="actions">
          {user ? <><Link className="btn" to="/torneos">Ver torneos</Link><Link className="btn ghost" to="/dashboard">Ir al dashboard</Link></> : (
            <>
              <Link className="btn" to="/registro">Crear cuenta</Link>
              <Link className="btn ghost" to="/login">Ya tengo cuenta</Link>
            </>
          )}
        </div>
      </section>
      {stats && (
        <section className="metrics" aria-label="Indicadores de la plataforma">
          {Object.entries(LABELS).map(([k, label]) => <div key={k}><strong>{stats[k]}</strong><span>{label}</span></div>)}
        </section>
      )}
    </>
  );
}
