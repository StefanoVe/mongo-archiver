import { CustomError } from './custom-error.js';

// Creo un nuovo errore che estende la classe CustomError
// da utilizzare sempre in caso di una generica richiesta
// non valida
export class BadRequestError extends CustomError {
  // Lo statusCode sarà sempre 400
  statusCode = 400;

  // Accetto come parametro del costruttore il messaggio d'errore
  constructor(public message: string) {
    // Ed estendo la classe padre (CustomError)
    super(message);

    // Questa riga è necessaria e non va MAI CANCELLATA e serve solo perché stiamo estendendo una classe
    // che a sua volta estende una classe nativa di JS (Error)
    // Vedi: https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, BadRequestError.prototype);
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
