import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Field, SelectField, FormModal } from '../components/forms.jsx';
import { GameBadge } from '../components/GameBadge.jsx';
import { ConfirmButton } from '../components/ConfirmButton.jsx';
import { QueryState } from '../components/QueryState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/client.js';
import { GAMES, GAME_OPTIONS } from '../lib/constants.js';
import { useApi } from '../lib/hooks.js';
import { run, toast } from '../lib/ui.js';


function TeamCard({ team, user, onModal, reload }) {
  const isCaptain = team.captainId === user.id;
  const isMember = team.members.some((m) => m.id === user.id);
  return (
    <article className="card">
      <div><GameBadge game={team.game} /> <span className="badge">{team.tag}</span></div>
      <h3>{team.name}</h3>
      <p className="meta">{team.members.length}/{GAMES[team.game].teamSize} jugadores</p>
      <ul className="members">
        {team.members.map((m) => (
          <li key={m.id}>
            <span>{m.nick}{m.id === team.captainId && ' (capitán)'}{m.pick && ` · ${m.pick.name}`}</span>
            {isCaptain && m.id !== user.id && (
              <button className="link" aria-label={`Quitar a ${m.nick}`}
                onClick={() => run(() => api.teams.removeMember(team.id, m.id), 'Jugador removido', reload)}>Quitar</button>
            )}
          </li>
        ))}
      </ul>
      {isMember && (
        <div className="actions">
          <Link className="btn ghost" to={`/equipos/${team.id}/historial`}>Historial</Link>
          {isCaptain && <>
          <button className="btn ghost" onClick={() => onModal({ type: 'add', team })}>Añadir jugador</button>
          <button className="btn ghost" onClick={() => onModal({ type: 'edit', team })}>Editar</button>
          <ConfirmButton message={`¿Eliminar el equipo "${team.name}"?`}
            onConfirm={() => run(() => api.teams.remove(team.id), 'Equipo eliminado', reload)}>Eliminar</ConfirmButton>
          </>}
        </div>
      )}
    </article>
  );
}

export default function Teams() {
  const { user } = useAuth();
  const [modal, setModal] = useState(null);
  const state = useApi(() => api.teams.list());
  const { data: teams, reload } = state;
  const close = () => setModal(null);
  // Los equipos donde el usuario es integrante van arriba; el resto se muestra aparte, solo para consulta
  const mine = (teams ?? []).filter((t) => t.members.some((m) => m.id === user.id));
  const others = (teams ?? []).filter((t) => !mine.includes(t));

  return (
    <section className="panel">
      <header className="row">
        <h1>Mis equipos</h1>
        <button className="btn" onClick={() => setModal({ type: 'new' })}>Crear equipo</button>
      </header>
      <QueryState {...state} hasData={Boolean(teams)} what="los equipos" />
      {teams && (
        <>
          {mine.length === 0 && <p className="empty">Aún no perteneces a ningún equipo. Crea uno o pide a un capitán que te añada.</p>}
          <div className="grid">{mine.map((t) => <TeamCard key={t.id} team={t} user={user} onModal={setModal} reload={reload} />)}</div>

          <h2 className="section-title">Otros equipos de la plataforma</h2>
          {others.length === 0 && <p className="empty">No hay otros equipos registrados.</p>}
          <div className="grid">{others.map((t) => <TeamCard key={t.id} team={t} user={user} onModal={setModal} reload={reload} />)}</div>
        </>
      )}

      {modal?.type === 'new' && (
        <FormModal title="Nuevo equipo" submitLabel="Crear equipo" onClose={close}
          onSubmit={async (d) => { await api.teams.create(d); toast('Equipo creado'); reload(); }}>
          <Field name="name" label="Nombre del equipo" />
          <Field name="tag" label="Tag (2 a 5 caracteres)" />
          <SelectField name="game" label="Juego" options={GAME_OPTIONS} />
        </FormModal>
      )}
      {modal?.type === 'edit' && (
        <FormModal title="Editar equipo" onClose={close}
          onSubmit={async (d) => { await api.teams.update(modal.team.id, d); toast('Equipo actualizado'); reload(); }}>
          <Field name="name" label="Nombre del equipo" defaultValue={modal.team.name} />
          <Field name="tag" label="Tag (2 a 5 caracteres)" defaultValue={modal.team.tag} />
        </FormModal>
      )}
      {modal?.type === 'add' && (
        <FormModal title="Añadir jugador" submitLabel="Añadir" onClose={close}
          onSubmit={async (d) => { await api.teams.addMember(modal.team.id, d.email); toast('Jugador añadido'); reload(); }}>
          <Field name="email" label="Correo del jugador registrado" type="email" />
        </FormModal>
      )}
    </section>
  );
}
