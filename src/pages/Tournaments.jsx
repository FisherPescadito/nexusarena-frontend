import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Field, SelectField, FormModal } from '../components/forms.jsx';
import { GameBadge } from '../components/GameBadge.jsx';
import { ConfirmButton } from '../components/ConfirmButton.jsx';
import { QueryState } from '../components/QueryState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/client.js';
import { GAMES, STATUS } from '../lib/constants.js';
import { useApi } from '../lib/hooks.js';
import { fmtDate, run, toast } from '../lib/ui.js';

const GAME_OPTIONS = Object.fromEntries(Object.entries(GAMES).map(([k, g]) => [k, g.name]));
const CUPOS = { 4: '4', 8: '8', 16: '16', 32: '32' };

export function TournamentFields({ t = {} }) {
  return (
    <>
      <Field name="name" label="Nombre del torneo" defaultValue={t.name} />
      <SelectField name="game" label="Juego" options={GAME_OPTIONS} defaultValue={t.game} />
      <Field name="date" label="Fecha de inicio" type="date" defaultValue={t.date} />
      <SelectField name="maxTeams" label="Cupo de equipos" options={CUPOS} defaultValue={t.maxTeams ?? 8} />
      <Field name="description" label="Descripción (opcional)" defaultValue={t.description} />
    </>
  );
}

function TournamentCard({ t, user, onModal, reload }) {
  const isOrg = user.role === 'organizer';
  const mine = t.registrations.find((r) => r.team.captainId === user.id);
  return (
    <article className="card">
      <div><GameBadge game={t.game} /> <span className={`badge st-${t.status}`}>{STATUS[t.status]}</span></div>
      <h3><Link to={`/torneos/${t.id}`}>{t.name}</Link></h3>
      <p>{t.description}</p>
      <p className="meta">{fmtDate(t.date)} · {t.registrations.length}/{t.maxTeams} equipos</p>
      <progress max={t.maxTeams} value={t.registrations.length} aria-label="Cupos ocupados" />
      <ul className="chips">{t.registrations.map((r) => <li key={r.id}>{r.team.name}</li>)}</ul>
      <div className="actions">
        <Link className="btn ghost" to={`/torneos/${t.id}`}>Ver detalle</Link>
        {isOrg && t.organizerId === user.id && (
          <>
            <button className="btn ghost" onClick={() => onModal({ type: 'edit', t })}>Editar</button>
            <ConfirmButton message={`¿Eliminar "${t.name}" y todas sus inscripciones y partidas?`}
              onConfirm={() => run(() => api.tournaments.remove(t.id), 'Torneo eliminado', reload)}>Eliminar</ConfirmButton>
          </>
        )}
        {!isOrg && !mine && t.status === 'open' && <button className="btn" onClick={() => onModal({ type: 'join', t })}>Inscribir equipo</button>}
        {mine && t.status === 'open' && (
          <button className="btn ghost" onClick={() => run(() => api.tournaments.cancel(t.id, mine.id), 'Inscripción retirada', reload)}>
            Retirar a {mine.team.name}
          </button>
        )}
      </div>
    </article>
  );
}

export default function Tournaments() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('');
  const [modal, setModal] = useState(null);
  const tournaments = useApi(() => api.tournaments.list(filter), [filter]);
  const { data: teams } = useApi(() => api.teams.list());
  const { data: list, reload } = tournaments;
  const isOrg = user.role === 'organizer';
  const close = () => setModal(null);

  const myTeamsFor = (game) => (teams ?? []).filter((m) => m.captainId === user.id && m.game === game);
  const openModal = (m) => {
    if (m.type === 'join' && !myTeamsFor(m.t.game).length)
      return toast(`Necesitas ser capitán de un equipo de ${GAMES[m.t.game].name}`, 'err');
    setModal(m);
  };

  return (
    <section className="panel">
      <header className="row">
        <h1>Torneos</h1>
        <div className="row">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrar por juego">
            <option value="">Todos los juegos</option>
            {Object.entries(GAME_OPTIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          {isOrg && <button className="btn" onClick={() => setModal({ type: 'new' })}>Nuevo torneo</button>}
        </div>
      </header>

      <QueryState {...tournaments} hasData={Boolean(list)} what="los torneos" />
      {list && !list.length && <p className="empty">No hay torneos para mostrar todavía.</p>}
      <div className="grid">
        {list?.map((t) => <TournamentCard key={t.id} t={t} user={user} onModal={openModal} reload={reload} />)}
      </div>

      {modal?.type === 'new' && (
        <FormModal title="Nuevo torneo" submitLabel="Crear torneo" onClose={close}
          onSubmit={async (d) => { await api.tournaments.create(d); toast('Torneo creado como borrador. Ábrelo desde su detalle.'); reload(); }}>
          <TournamentFields />
        </FormModal>
      )}
      {modal?.type === 'edit' && (
        <FormModal title="Editar torneo" onClose={close}
          onSubmit={async (d) => { await api.tournaments.update(modal.t.id, d); toast('Torneo actualizado'); reload(); }}>
          <TournamentFields t={modal.t} />
        </FormModal>
      )}
      {modal?.type === 'join' && (
        <FormModal title={`Inscribirse en ${modal.t.name}`} submitLabel="Inscribir" onClose={close}
          onSubmit={async (d) => { await api.tournaments.register(modal.t.id, d.teamId); toast('Equipo inscrito'); reload(); }}>
          <SelectField name="teamId" label="Equipo"
            options={Object.fromEntries(myTeamsFor(modal.t.game).map((m) => [m.id, `${m.name} (${m.members.length}/${GAMES[m.game].teamSize})`]))} />
        </FormModal>
      )}
    </section>
  );
}
