import { Component } from 'react';

/** Si una pantalla lanza un error inesperado, muestra un mensaje en vez de dejar la página en blanco. */
export class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error(error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="panel" role="alert">
        <h1>Algo salió mal</h1>
        <p>Ocurrió un error inesperado. Puedes volver a intentarlo.</p>
        <button className="btn" onClick={() => window.location.reload()}>Recargar la página</button>
      </section>
    );
  }
}
