//boilerplate for an express route
import express from 'express';
import { getCronJobRouter } from './get.js';
import { addCronJobRouter } from './post.add.js';

const router = express.Router();

// router.use('/cron');
router.use('/add', addCronJobRouter);
router.use('/get', getCronJobRouter);

export { router as cronRouter };
