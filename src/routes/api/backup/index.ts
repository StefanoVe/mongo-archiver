import express from 'express';
import { getBackupRouter } from './get.js';

const router = express.Router();

// router.use('/cron');
router.use('/get', getBackupRouter);

export { router as backupRouter };
