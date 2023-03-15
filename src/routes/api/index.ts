//boilerplate for an express route
import express from 'express';
import { databaseRouter } from './database/index.js';

const router = express.Router();

// router.use('/cron');
router.use('/db', databaseRouter);

export { router as apiRouter };
