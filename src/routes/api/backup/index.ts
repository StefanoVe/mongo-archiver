import express from 'express';
import { getBackupRouter } from './get.js';

const router = express.Router();

// router.use('/cron');
router.use('/', getBackupRouter);

export { router as backupRouter };
