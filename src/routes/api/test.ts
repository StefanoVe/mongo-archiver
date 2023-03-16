//boiler plate for an express post request
import express from 'express';
import { CronJobModel } from '../../models/cron-job.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const r = await CronJobModel.findOne({});

  if (!r) {
    return res.send('not found');
  }

  r.enabled = false;

  await r?.save();

  res.send('ok');
});

export { router as testRouter };
