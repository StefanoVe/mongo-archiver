import cors from 'cors';
import express from 'express';
import { NotFoundError } from '../services/error-handler/errors/not-found-error.js';
import { errorHandler } from '../services/error-handler/middlewares/index.js';
import { apiRouter } from './api/index.js';

export const app = express();

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api', apiRouter);
app.all('*', (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);
