//boilerplate for an express route
import express from 'express';
import { getDatabaseRouter } from './get.js';
import { addDatabaseRouter } from './post.add.js';

const router = express.Router();

router.use('/add', addDatabaseRouter);
router.use('/get', getDatabaseRouter);

export { router as databaseRouter };
