import { colorfulLog } from '../../services/service.utils.js';
import { BadRequestError } from '../errors/bad-request-error.js';

export const genericErrorHandler = async (error: Error, inviaMail = true) => {
  colorfulLog(JSON.stringify(error), 'warning');

  const message =
    error && error.message
      ? error.message
      : `Errore generico ${JSON.stringify(error)}`;

  throw new BadRequestError(message);
};
