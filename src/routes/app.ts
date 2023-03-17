import cors from 'cors';
import express from 'express';
import { NotFoundError } from '../errors/errors/not-found-error.js';
import { errorHandler } from '../errors/middlewares/index.js';
import { requireApiKey } from '../services/validation/service.require-api-key.js';
import { apiRouter } from './api/index.js';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler);
app.use(requireApiKey);

app.get('/', (req, res) => {
  res.send({ result: 'Hello World!' });
});
app.use('/api', apiRouter);

app.all('*', (req, res) => {
  throw new NotFoundError();
});
