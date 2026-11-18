import { useEffect, useState } from 'react';
import { getPicks } from './externalApi.js';

/** Llama a una función async (petición al backend) y guarda { data, loading, error }. reload() repite la petición. */
export function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    fetcher()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error) => !cancelled && setState({ data: null, loading: false, error }));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}

/** Carga campeones/agentes desde las APIs públicas (Riot y Valorant). */
export function usePicks(game) {
  const [state, setState] = useState({ picks: [], loading: true, error: false });
  useEffect(() => {
    let cancelled = false;
    getPicks(game)
      .then((picks) => !cancelled && setState({ picks, loading: false, error: false }))
      .catch(() => !cancelled && setState({ picks: [], loading: false, error: true }));
    return () => { cancelled = true; };
  }, [game]);
  return state;
}
