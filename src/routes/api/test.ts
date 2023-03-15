//boiler plate for an express post request
import express from 'express';
import { genericErrorHandler } from '../../errors/services/generic-error-handler.js';
import { CronJobModel } from '../../models/cron-job.js';
import { DatabaseModel } from '../../models/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const database = DatabaseModel.build({
    alias: 'testDatabase',
    uri: 'mongodb://localhost:27017/back-office',
  });

  await database.save().catch(genericErrorHandler);

  const result = CronJobModel.build({
    alias: 'testCronJob',
    cronJob: '* * * * * *',
    databases: [database._id],
    recipient: 'stefano.vecchietti.99@gmail.com',
  });

  await result.save().catch(genericErrorHandler);
  // await result.populate('databases').catch(genericErrorHandler);

  // const _backupManager = await BackupManager.init(result);
  // await _backupManager.startJob().catch(genericErrorHandler);

  // await _backupManager.sendToRecipient().catch(genericErrorHandler);

  res.send('ok');
});

export { router as testRouter };
