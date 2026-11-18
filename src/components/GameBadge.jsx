import { GAMES } from '../lib/constants.js';
export const GameBadge = ({ game }) => <span className={`badge ${game}`}>{GAMES[game].name}</span>;
