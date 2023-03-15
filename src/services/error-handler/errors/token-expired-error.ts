import { CustomError } from './custom-error.js';

export class TokenExpiredError extends CustomError {
  statusCode = 401;

  constructor() {
    super('Il token di accesso è scaduto');

    Object.setPrototypeOf(this, TokenExpiredError.prototype);
  }

  serializeErrors() {
    return [
      {
        message: this.message,
      },
    ];
  }
}
