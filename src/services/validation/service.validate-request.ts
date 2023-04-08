import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { RequestValidationError } from '../../errors/errors/request-validation-error.js';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Lancio un errore di tipo RequestValidationError passando l'array di errori
    throw new RequestValidationError(errors.array());
  }

  next();
};
