import { NextFunction, Request, Response } from 'express';
import { NotAuthorizedError } from '../../errors/errors/not-authorized-error.js';
import { declareEnvs } from '../service.utils.js';

const { API_KEY } = declareEnvs(['API_KEY']);

export const requireApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.headers.apikey !== API_KEY) {
    throw new NotAuthorizedError();
  }

  next();
};
