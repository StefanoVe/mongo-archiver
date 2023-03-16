import * as cron from 'node-cron';
import { genericErrorHandler } from '../errors/services/generic-error-handler.js';
import { CronJobModel } from '../models/cron-job.js';
import {
  BackupManager,
  EnumAvailableCompression,
} from './backup/class.backupmanager.js';
import { asyncForEach, colorfulLog } from './service.utils.js';

export const runSchedule = async () => {
  const jobs = await CronJobModel.find({ enabled: true }).populate('databases');

  console.log(`Found ${jobs.length} jobs to schedule`);

  await asyncForEach(jobs, async (job) => {
    //for each job, schedule it with node-cron
    cron.schedule(job.cronJob, async () => {
      //initiate the backup manager
      const _backupManager = await BackupManager.init(
        job,
        job.compression || EnumAvailableCompression.none
      ).catch(genericErrorHandler);

      //backup the chosen collections
      await _backupManager.startJob().catch((error) => {
        colorfulLog('job failed!', 'error');
      });

      //send the backup to the recipient
      // await _backupManager.sendToRecipient().catch(genericErrorHandler);
    });
  });
};
