export const fmtDate = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

/** "hace 5 min", "hace 2 h"... */
export function timeAgo(iso) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'justo ahora';
  if (min < 60) return `hace ${min} min`;
  if (min < 1440) return `hace ${Math.round(min / 60)} h`;
  return `hace ${Math.round(min / 1440)} d`;
}

// Región "aria-live": los lectores de pantalla anuncian cada aviso sin mover el foco.
function toastRegion() {
  let el = document.getElementById('toasts');
  if (!el) {
    el = Object.assign(document.createElement('div'), { id: 'toasts' });
    el.setAttribute('aria-live', 'polite');
    document.body.append(el);
  }
  return el;
}

export function toast(message, type = 'ok') {
  const el = Object.assign(document.createElement('div'), { className: `toast ${type}`, textContent: message });
  toastRegion().append(el);
  setTimeout(() => el.remove(), 4000);
}

/** Ejecuta una acción async, muestra el resultado como aviso y, si salió bien, ejecuta "after" (por ejemplo recargar la lista). */
export async function run(action, okMessage, after) {
  try { await action(); toast(okMessage); after?.(); }
  catch (e) { toast(e.message, 'err'); }
}
