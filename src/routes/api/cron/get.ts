//boiler plate for an express post request
import express from 'express';
import { param } from 'express-validator';
import { Types } from 'mongoose';
import {
  CronJobModel,
  CRON_JOB_VALIDATION_MESSAGES,
} from '../../../models/cron-job.js';
import { validateRequest } from '../../../services/validation/service.validate-request.js';

const router = express.Router();

router.get(
  '/:id?',
  param('id')
    .optional()
    .isMongoId()
    .withMessage(CRON_JOB_VALIDATION_MESSAGES._id),
  validateRequest,
  async (req, res) => {
    const { id } = req.params;

    if (!id?.length) {
      const database = await CronJobModel.find({}).populate('databases');

      return res.send(database);
    }

    const _mongoId = new Types.ObjectId(id);
    const cronjob = await CronJobModel.findById(_mongoId).populate('databases');

    if (!cronjob) {
      return res.status(404).send({ error: 'cronjob not found' });
    }

    res.send(cronjob);
  }
);

export { router as getCronJobRouter };
