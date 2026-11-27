import { Link, useParams } from 'react-router-dom';
import { GameBadge } from '../components/GameBadge.jsx';
import { QueryState } from '../components/QueryState.jsx';
import { api } from '../lib/client.js';
import { STATUS } from '../lib/constants.js';
import { useApi } from '../lib/hooks.js';
import { fmtDate } from '../lib/ui.js';

const RESULT = { won: 'Victoria', lost: 'Derrota', pending: 'Pendiente', bye: 'Pasa sin jugar (bye)' };

/** Historial de un equipo: torneos en los que participó, sus partidas y su posición final (más reciente primero). */
export default function TeamHistory() {
  const { id } = useParams();
  const state = useApi(() => api.teams.history(id), [id]);
  const { data } = state;
  return (
    <section className="panel">
      <Link to="/equipos">← Volver a mis equipos</Link>
      <h1>Historial{data ? `: ${data.team.name}` : ''}</h1>
      <QueryState {...state} hasData={Boolean(data)} what="el historial" />
      {data && !data.history.length && <p className="empty">Tu equipo aún no ha participado en torneos</p>}
      {data?.history.map(({ tournament: t, placement, matches }) => (
        <article className="history-item" key={t.id}>
          <h2><Link to={`/torneos/${t.id}`}>{t.name}</Link></h2>
          <p><GameBadge game={t.game} /> <span className={`badge st-${t.status}`}>{STATUS[t.status]}</span></p>
          <p className="meta">{fmtDate(t.date)} · Resultado final: <strong>{placement}</strong></p>
          {matches.length > 0 && (
            <ul className="plain">
              {matches.map((m) => (
                <li key={`${t.id}-${m.round}`}>
                  Ronda {m.round}: {m.opponent ? `vs ${m.opponent}` : 'sin rival'}
                  {m.score && ` · ${m.score.own} - ${m.score.rival}`}{' '}
                  <span className={`result ${m.result}`}>{RESULT[m.result]}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </section>
  );
}
