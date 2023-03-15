import { ValidationError } from 'express-validator';
import { CustomError } from './custom-error.js';

// Creo un nuovo errore che estende la classe CustomError
// da utilizzare sempre in caso di errore di validazione
export class RequestValidationError extends CustomError {
  // Lo statusCode sarà sempre 400
  statusCode = 400;

  // Accetto come parametro del costruttore un array di errori
  // di validazione. A differenza degli altri customError,
  // qui posso avere più messaggi contemporaneamente perché
  // magari valido più campi contemporaneamente
  constructor(private errors: ValidationError[]) {
    // In realtà il messaggio che passo qui al costruttore del padre
    // è inutile perché non viene utilizzato in nessun modo, ma essendo
    // richiesto non posso non passarlo. A limite potrei passare una
    // stringa vuota.
    super('Errore di validazione');

    // Questa riga è necessaria e non va MAI CANCELLATA e serve solo perché stiamo estendendo una classe
    // che a sua volta estende una classe nativa di JS (Error)
    // Vedi: https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  // La classe abstract CustomError ci dice che DEVE ESSERE IMPLEMENTATA
  // la funzione serializeErrors che restituisce un array di errori
  // quindi la implemento qui.
  // In questo caso avrò una proprietà errors (passata nel costruttore)
  // contenenete tutti gli errori di validazione di tipo ValidationError[]
  // faccio quindi un map sull'array per formattare correttamente i messaggi
  // e restituisco quindi un array di errori { message: string, field: string}
  serializeErrors() {
    return this.errors.map((err) => ({
      message: err.msg,
      field: err.param,
    }));
  }
}
