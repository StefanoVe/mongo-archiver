//boiler plate for an express post request
import express from 'express';
import { body } from 'express-validator';
import { Types } from 'mongoose';
import * as nodeCron from 'node-cron';
import {
  CronJobModel,
  CRON_JOB_VALIDATION_MESSAGES,
} from '../../../models/cron-job.js';
import { EnumAvailableCompression } from '../../../services/backup/class.backupmanager.js';
import { validateRequest } from '../../../services/validation/service.validate-request.js';
const router = express.Router();

router.post(
  '/',
  body('alias').isString().withMessage(CRON_JOB_VALIDATION_MESSAGES.alias),
  body('expression')
    .custom(nodeCron.validate)
    .withMessage(CRON_JOB_VALIDATION_MESSAGES.expression),
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage(CRON_JOB_VALIDATION_MESSAGES.enabled),
  body('compression')
    .isIn(Object.values(EnumAvailableCompression))
    .withMessage(CRON_JOB_VALIDATION_MESSAGES.compression),
  body('databases')
    .isArray()
    .custom((value) => value.every(Types.ObjectId.isValid))
    .withMessage(CRON_JOB_VALIDATION_MESSAGES.databases),
  validateRequest,
  async (req, res) => {
    const { alias, enabled, compression, databases, expression } = req.body;

    const _lowerCaseAlias = alias.toLowerCase();
    const _databasesObjectId = (databases as string[]).map(
      (id) => new Types.ObjectId(id)
    );

    const existingcCron = await CronJobModel.findOne({
      $or: [{ alias: _lowerCaseAlias }, { expression }],
    });

    if (existingcCron) {
      res.status(400).send({
        error: 'Cron with the same alias or cron expression already exists',
      });
    }

    const cronJob = CronJobModel.build({
      alias: _lowerCaseAlias,
      expression,
      databases: _databasesObjectId,
      compression,
      enabled,
    });

    await cronJob.save();

    res.send(cronJob);
  }
);

export { router as addCronJobRouter };
