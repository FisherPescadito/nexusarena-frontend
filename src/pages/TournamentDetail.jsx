import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FormModal } from '../components/forms.jsx';
import { Bracket } from '../components/Bracket.jsx';
import { ConfirmButton } from '../components/ConfirmButton.jsx';
import { GameBadge } from '../components/GameBadge.jsx';
import { QueryState } from '../components/QueryState.jsx';
import { TournamentFields } from './Tournaments.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/client.js';
import { STATUS } from '../lib/constants.js';
import { useApi } from '../lib/hooks.js';
import { fmtDate, run, toast } from '../lib/ui.js';

// Qué botón de estado ve el organizador según el estado actual del torneo
const STATUS_ACTIONS = {
  draft: [{ to: 'open', label: 'Abrir inscripciones' }],
  open: [{ to: 'closed', label: 'Cerrar inscripciones' }],
  closed: [{ to: 'open', label: 'Reabrir inscripciones' }],
};

export default function TournamentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const state = useApi(() => api.tournaments.get(id), [id]);
  const { data: t, reload } = state;

  if (!t) {
    return (
      <section className="panel">
        <QueryState {...state} hasData={false} what="el torneo" />
        <Link to="/torneos">← Volver a torneos</Link>
      </section>
    );
  }

  const isOwner = user.role === 'organizer' && t.organizerId === user.id;
  const canGenerate = isOwner && t.status === 'closed' && t.registrations.length >= 2;

  return (
    <>
      <section className="panel">
        <Link to="/torneos">← Volver a torneos</Link>
        <header className="row">
          <div>
            <h1>{t.name}</h1>
            <p><GameBadge game={t.game} /> <span className={`badge st-${t.status}`}>{STATUS[t.status]}</span></p>
            <p className="meta">{fmtDate(t.date)} · {t.registrations.length}/{t.maxTeams} equipos inscritos</p>
            {t.description && <p>{t.description}</p>}
          </div>
          {isOwner && (
            <div className="actions">
              {STATUS_ACTIONS[t.status]?.map((a) => (
                <button key={a.to} className="btn" onClick={() => run(() => api.tournaments.setStatus(t.id, a.to), 'Estado actualizado', reload)}>{a.label}</button>
              ))}
              {canGenerate && (
                <ConfirmButton className="btn" confirmLabel="Generar bracket"
                  message="Se sortearán los enfrentamientos y ya no podrás reabrir las inscripciones. ¿Continuar?"
                  onConfirm={() => run(() => api.tournaments.generateBracket(t.id), 'Bracket generado', reload)}>Generar bracket</ConfirmButton>
              )}
              <button className="btn ghost" onClick={() => setEditing(true)}>Editar</button>
              <ConfirmButton message={`¿Eliminar "${t.name}"?`}
                onConfirm={() => run(() => api.tournaments.remove(t.id), 'Torneo eliminado', () => navigate('/torneos'))}>Eliminar</ConfirmButton>
            </div>
          )}
        </header>
        {t.champion && <p className="champion" role="status">🏆 Campeón: <strong>{t.champion.name}</strong></p>}
        {isOwner && t.status === 'closed' && t.registrations.length < 2 && (
          <p className="hint">Se necesitan al menos 2 equipos inscritos para generar el bracket.</p>
        )}
      </section>

      <section className="panel">
        <h2>Equipos inscritos</h2>
        {t.registrations.length ? (
          <ul className="chips">{t.registrations.map((r) => <li key={r.id}>{r.team.name}</li>)}</ul>
        ) : <p className="empty">Todavía no hay equipos inscritos.</p>}
      </section>

      <section className="panel">
        <h2>Bracket</h2>
        {t.matches.length ? (
          <>
            {isOwner && t.status !== 'finished' && <p className="hint">Ingresa el marcador de cada partida. No se permiten empates.</p>}
            <Bracket tournament={t} canEdit={isOwner} onSaved={reload} />
          </>
        ) : <p className="empty">El bracket aparecerá cuando el organizador cierre las inscripciones y lo genere.</p>}
      </section>

      {editing && (
        <FormModal title="Editar torneo" onClose={() => setEditing(false)}
          onSubmit={async (d) => { await api.tournaments.update(t.id, d); toast('Torneo actualizado'); reload(); }}>
          <TournamentFields t={t} />
        </FormModal>
      )}
    </>
  );
}
