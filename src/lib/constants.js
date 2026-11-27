export const GAMES = {
  lol: { name: 'League of Legends', teamSize: 5 },
  valorant: { name: 'Valorant', teamSize: 5 },
};
export const STATUS = { draft: 'Borrador', open: 'Inscripciones abiertas', closed: 'Inscripciones cerradas', ongoing: 'En juego', finished: 'Finalizado' };
export const ROLES = { player: 'Jugador', organizer: 'Organizador' };
export const GAME_OPTIONS = Object.fromEntries(Object.entries(GAMES).map(([k, g]) => [k, g.name]));
