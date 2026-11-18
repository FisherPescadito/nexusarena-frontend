import { useRef } from 'react';

/** Botón que pide confirmación en un diálogo propio (en vez del window.confirm del navegador). */
export function ConfirmButton({ message, onConfirm, children, className = 'btn danger', confirmLabel = 'Confirmar' }) {
  const ref = useRef(null);
  return (
    <>
      <button className={className} onClick={() => ref.current.showModal()}>{children}</button>
      <dialog ref={ref} aria-label="Confirmación">
        <p>{message}</p>
        <menu>
          <button className="btn ghost" onClick={() => ref.current.close()}>Cancelar</button>
          <button className="btn danger" onClick={() => { ref.current.close(); onConfirm(); }}>{confirmLabel}</button>
        </menu>
      </dialog>
    </>
  );
}
