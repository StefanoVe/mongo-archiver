//boilerplate for an express route
import express from 'express';
import { backupRouter } from './backup/index.js';
import { databaseRouter } from './database/index.js';
import { testRouter } from './test.js';

const router = express.Router();

// router.use('/cron');
router.use('/backup', backupRouter);
router.use('/test', testRouter);
router.use('/db', databaseRouter);

export { router as apiRouter };
