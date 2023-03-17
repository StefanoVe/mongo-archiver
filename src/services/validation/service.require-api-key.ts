import { NextFunction, Request, Response } from 'express';
import { declareEnvs } from '../service.utils.js';

const { API_KEY } = declareEnvs(['API_KEY']);

export const requireApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.headers['x-api-key'] !== API_KEY) {
    res.status(401).send({
      error: 'Not authorized',
    });
  }

  next();
};
