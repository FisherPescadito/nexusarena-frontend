/** Muestra "Cargando…" o un error con botón Reintentar. No muestra nada cuando todo va bien. */
export function QueryState({ loading, error, hasData, reload, what = 'los datos' }) {
  if (error) {
    return (
      <div className="state" role="alert">
        <p>Error al cargar {what}: {error.message}</p>
        <button className="btn ghost" onClick={reload}>Reintentar</button>
      </div>
    );
  }
  if (loading && !hasData) return <p className="empty" aria-busy="true">Cargando…</p>;
  return null;
}
