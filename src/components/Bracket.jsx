import { Form } from './forms.jsx';
import { api } from '../lib/client.js';
import { toast } from '../lib/ui.js';

const roundName = (round, total) => ['Final', 'Semifinal', 'Cuartos de final', 'Octavos de final'][total - round] ?? `Ronda ${round}`;

function Match({ match, tournamentId, canEdit, onSaved }) {
  const { team1, team2, score1, score2, winnerId } = match;
  const isBye = winnerId && (!team1 || !team2);
  const row = (team, score) => (
    <div className={`team-row ${team && winnerId === team.id ? 'winner' : ''}`}>
      <span>{team?.name ?? (isBye ? 'Descansa' : 'Por definir')}</span>
      <strong>{score ?? ''}</strong>
    </div>
  );
  return (
    <div className="match">
      {row(team1, score1)}
      {row(team2, score2)}
      {isBye && <small className="meta">Avanza sin jugar (bye)</small>}
      {canEdit && team1 && team2 && (
        <Form onSubmit={async (d) => { await api.tournaments.saveResult(tournamentId, match.id, d.score1, d.score2); toast('Resultado guardado'); onSaved(); }}>
          <div className="score-row">
            <input name="score1" type="number" min="0" defaultValue={score1 ?? ''} aria-label={`Puntos de ${team1.name}`} />
            <span aria-hidden="true">-</span>
            <input name="score2" type="number" min="0" defaultValue={score2 ?? ''} aria-label={`Puntos de ${team2.name}`} />
            <button className="btn ghost">{winnerId ? 'Corregir' : 'Guardar'}</button>
          </div>
        </Form>
      )}
    </div>
  );
}

/** Bracket de eliminación: una columna por ronda. */
export function Bracket({ tournament, canEdit, onSaved }) {
  const rounds = Array.from({ length: tournament.rounds }, (_, i) => i + 1);
  return (
    <div className="bracket" role="group" aria-label="Bracket del torneo">
      {rounds.map((r) => (
        <div className="round" key={r}>
          <h3>{roundName(r, tournament.rounds)}</h3>
          {tournament.matches.filter((m) => m.round === r).map((m) => (
            <Match key={m.id} match={m} tournamentId={tournament.id} canEdit={canEdit} onSaved={onSaved} />
          ))}
        </div>
      ))}
    </div>
  );
}
