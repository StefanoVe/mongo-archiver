import * as cron from 'node-cron';
import { Subject, tap } from 'rxjs';
import { genericErrorHandler } from '../errors/services/generic-error-handler.js';
import { CronJobModel } from '../models/cron-job.js';
import {
  BackupManager,
  EnumAvailableCompression,
} from './backup/class.backupmanager.js';
import { asyncForEach, colorfulLog, declareEnvs } from './service.utils.js';

const { RUN_SCHEDULE } = declareEnvs(['RUN_SCHEDULE']);

//declaring a subject to reload the schedule every time a job is added or removed from the database
export const reloadSchedule$ = new Subject<void>();

//subscribing to the subject to reload the schedule
reloadSchedule$
  .pipe(
    tap(async () => {
      cron.getTasks().forEach((task) => {
        task.stop();
      });
      colorfulLog('reloading schedule', 'info');
      await _buildSchedule();
    })
  )
  .subscribe();

/**
 * Bootstrap function to run the schedule on server start
 */
export const runSchedule = async () => {
  if (RUN_SCHEDULE !== '1') {
    colorfulLog('CRON Schedule is disabled', 'warning');
    return;
  }

  reloadSchedule$.next();
};

const _buildSchedule = async () => {
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
