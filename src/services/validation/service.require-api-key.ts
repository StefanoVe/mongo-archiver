import { NextFunction, Request, Response } from 'express';
import { colorfulLog, declareEnvs } from '../service.utils.js';

const { API_KEY } = declareEnvs(['API_KEY']);

export const requireApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const route = `${req.method} ${req.path}`;
  const timestamp = new Date().toISOString();

  if (req.headers['x-api-key'] !== API_KEY) {
    colorfulLog(`${timestamp} | ${route} | Invalid API Key `, 'error');
    res.status(401).send({
      error: 'Not authorized',
    });
    return;
  }

  colorfulLog(`${timestamp} | ${route}`, 'info');

  next();
};
