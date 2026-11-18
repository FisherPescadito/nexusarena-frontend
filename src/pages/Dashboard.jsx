import { Link } from 'react-router-dom';
import { QueryState } from '../components/QueryState.jsx';
import { GameBadge } from '../components/GameBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/client.js';
import { GAMES, STATUS } from '../lib/constants.js';
import { useApi } from '../lib/hooks.js';
import { timeAgo } from '../lib/ui.js';

const TOTALS = { users: 'Usuarios', teams: 'Equipos', tournaments: 'Torneos', registrations: 'Inscripciones', matchesPlayed: 'Partidas jugadas' };
const EVENT_TEXT = { user: 'Nuevo usuario', team: 'Nuevo equipo', tournament: 'Nuevo torneo', registration: 'Inscripción' };

/** Barra horizontal simple hecha con CSS (sin librerías de gráficos). */
const Bar = ({ label, value, max }) => (
  <div className="bar-row">
    <span>{label}</span>
    <div className="bar" aria-hidden="true"><span style={{ width: `${max ? (value / max) * 100 : 0}%` }} /></div>
    <strong>{value}</strong>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const state = useApi(() => api.dashboard());
  const { data: d } = state;
  const maxStatus = d ? Math.max(1, ...Object.values(d.byStatus)) : 1;

  return (
    <>
      <section className="panel">
        <header className="row"><h1>Dashboard</h1><button className="btn ghost" onClick={state.reload}>Actualizar</button></header>
        <QueryState {...state} hasData={Boolean(d)} what="el dashboard" />
        {d && (
          <div className="metrics" aria-label="Totales de la plataforma">
            {Object.entries(TOTALS).map(([k, label]) => <div key={k}><strong>{d.totals[k]}</strong><span>{label}</span></div>)}
          </div>
        )}
      </section>

      {d && (
        <>
          <section className="panel">
            <h2>{user.role === 'player' ? 'Mi actividad' : 'Mis torneos'}</h2>
            {user.role === 'player' ? (
              <>
                <p><strong>{d.mine.teams.length}</strong> equipo(s) · <strong>{d.mine.wins ?? 0}</strong> victoria(s) · <strong>{d.mine.losses ?? 0}</strong> derrota(s)</p>
                {d.mine.teams.length > 0 && <ul className="chips">{d.mine.teams.map((t) => <li key={t.id}>{t.name} ({GAMES[t.game].name})</li>)}</ul>}
                {d.mine.results?.length > 0 && (
                  <>
                    <h3>Últimos resultados</h3>
                    <ul className="plain">
                      {d.mine.results.map((r) => (
                        <li key={r.id}>{r.team1} {r.score1} - {r.score2} {r.team2} <span className="meta">({r.tournament})</span>{' '}
                          <span className={`badge ${r.won ? 'st-open' : ''}`}>{r.won ? 'Victoria' : 'Derrota'}</span></li>
                      ))}
                    </ul>
                  </>
                )}
                {!d.mine.teams.length && <p className="empty">Aún no tienes equipo. <Link to="/equipos">Crea uno</Link>.</p>}
              </>
            ) : (
              Object.keys(d.mine.tournamentsByStatus).length
                ? <ul className="chips">{Object.entries(d.mine.tournamentsByStatus).map(([s, n]) => <li key={s}>{STATUS[s]}: {n}</li>)}</ul>
                : <p className="empty">Aún no has creado torneos. <Link to="/torneos">Crea el primero</Link>.</p>
            )}
          </section>

          <div className="two-cols">
            <section className="panel">
              <h2>Torneos por estado</h2>
              {Object.keys(STATUS).map((s) => <Bar key={s} label={STATUS[s]} value={d.byStatus[s] ?? 0} max={maxStatus} />)}
              <h3>Por juego</h3>
              {d.byGame.map((g) => <p key={g.game}><GameBadge game={g.game} /> {g.tournaments} torneo(s) · {g.teams} equipo(s)</p>)}
            </section>

            <section className="panel">
              <h2>Ocupación de cupos</h2>
              {d.occupancy.length ? d.occupancy.map((t) => (
                <div key={t.id} className="occupancy">
                  <Link to={`/torneos/${t.id}`}>{t.name}</Link>
                  <progress max={t.maxTeams} value={t.registered} aria-label={`${t.registered} de ${t.maxTeams} cupos`} />
                  <span className="meta">{t.registered}/{t.maxTeams} equipos</span>
                </div>
              )) : <p className="empty">No hay torneos con inscripciones abiertas.</p>}
            </section>
          </div>

          <section className="panel">
            <h2>Actividad reciente</h2>
            <ul className="plain">
              {d.recent.map((e, i) => (
                <li key={i}><span className="badge">{EVENT_TEXT[e.type]}</span> {e.text} <span className="meta">· {timeAgo(e.at)}</span></li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  );
}
