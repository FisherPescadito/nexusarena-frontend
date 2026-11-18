/** Error con mensaje general y errores por campo, tal como los devuelve el backend. */
export class BusinessError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.name = 'BusinessError';
    this.errors = errors; // { campo: 'mensaje' }
  }
}
