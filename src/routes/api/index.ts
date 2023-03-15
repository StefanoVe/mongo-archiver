//boilerplate for an express route
import express from 'express';
import { databaseRouter } from './database/index.js';
import { testRouter } from './test.js';

const router = express.Router();

// router.use('/cron');
router.use('/test', testRouter);
router.use('/db', databaseRouter);

export { router as apiRouter };
