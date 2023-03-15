import { CustomError } from './custom-error.js';

// Creo un nuovo errore che estende la classe CustomError
// da utilizzare sempre in caso di errore di autenticazione
export class NotAuthorizedError extends CustomError {
  // Lo statusCode è sempre 401
  statusCode = 401;

  // Non accetto parametri perché il messaggio non sarà dinamico
  // ma sempre lo stesso!
  constructor() {
    // Passo il messaggio al costruttore della classe padre
    super('Non sei autorizzato');

    // Questa riga è necessaria e non va MAI CANCELLATA e serve solo perché stiamo estendendo una classe
    // che a sua volta estende una classe nativa di JS (Error)
    // Vedi: https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  // La classe abstract CustomError ci dice che DEVE ESSERE IMPLEMENTATA
  // la funzione serializeErrors che restituisce un array di errori
  // quindi la implemento qui. Essendo questo specifico errore uno solo e
  // non un array di errori (come ad esempio quando facciamo la validazione)
  // restituisco direttamente un array contentente un singolo oggetto
  serializeErrors() {
    return [
      {
        message: this.message,
      },
    ];
  }
}
