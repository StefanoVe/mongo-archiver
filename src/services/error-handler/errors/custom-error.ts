// Le classi abstract non possono essere istanziate (es. New CustomError()),
// ma possono essere utilizzate come base per altre classi

// In questo caso la classe astratta CustomError estende anche la classe Error,
// ovvero ne eredita tutti i metodi e le proprietà

// Vedi qui cos'è la classe Error in JavaScript: https://developer.mozilla.org/en-US/docs/web/javascript/reference/global_objects/error
export abstract class CustomError extends Error {
  // Dichiaro una proprietà di tipo numero che rappresenta il codice HTTP di errore
  // Qui trovi una lista di tutti i codici HTTP: https://httpstatuses.com/
  abstract statusCode: number;

  // Dichiaro il costruttore della classe che accetta come parametro una stringa
  // che rappresenterà il messaggio di errore
  constructor(message: string) {
    // Richiamo il costruttore della classe padre (Error)
    // super() è il metodo che utilizza JavaScript per richiamare il costruttore
    // delle classi padre
    // Vedi qui: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super?retiredLocale=it
    super(message);

    // Questa riga è necessaria e non va MAI CANCELLATA e serve solo perché stiamo estendendo una classe
    // nativa di JS (Error)
    // Vedi: https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  // Dichiaro un metodo definendo già il tipo restituito, ovvero un oggetto contentente un messagge ed un field (opzionale)
  // nb: nelle classi astratte non si definisce il metodo, ma solo il fatto che ci sarà e che cosa restituirà, sarà
  //     compito delle classi figlie di CustomError definirne la logica
  abstract serializeErrors(): { message: string; field?: string }[];
}
