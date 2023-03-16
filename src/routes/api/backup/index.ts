import express from 'express';
import { downloadBackupRouter } from './download.js';
import { getBackupRouter } from './get.js';

const router = express.Router();

// router.use('/cron');
router.use('/get', getBackupRouter);
router.use('/download', downloadBackupRouter);

export { router as backupRouter };
