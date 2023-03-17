import { endOfDay, startOfDay, subDays } from 'date-fns';
import * as cron from 'node-cron';
import { Subject, tap } from 'rxjs';
import { genericErrorHandler } from '../errors/services/generic-error-handler.js';
import { BackupModel } from '../models/backup.js';
import { CronJobModel } from '../models/cron-job.js';
import { BackupManager } from './backup/class.backupmanager.js';
import { asyncForEach, colorfulLog, declareEnvs } from './service.utils.js';

const { RUN_SCHEDULE, DELETE_OLDER_THAN } = declareEnvs([
  'RUN_SCHEDULE',
  'DELETE_OLDER_THAN',
]);

const _runSchedule = RUN_SCHEDULE === '1';

//declaring a subject to reload the schedule every time a job is added or removed from the database
export const reloadSchedule$ = new Subject<void>();

//subscribing to the subject to reload the schedule
reloadSchedule$
  .pipe(
    tap(async () => {
      cron.getTasks().forEach((task) => {
        task.stop();
      });

      if (!_runSchedule) {
        return;
      }

      colorfulLog('reloading schedule', 'info');
      await _buildSchedule();
    })
  )
  .subscribe();

//every day at 00:00 run the schedule
cron.schedule(' 0 0 * * *', async () => {
  //find all backups older than N days and delete them

  const _deleteOlderThan = parseInt(DELETE_OLDER_THAN || '-1');

  if (_deleteOlderThan < 0) {
    colorfulLog('DELETE_OLDER_THAN is not set', 'warning');
    return;
  }

  const NDaysAgo = subDays(new Date(), _deleteOlderThan);

  const backups = await BackupModel.find({
    createdAt: { $gte: startOfDay(NDaysAgo), $lte: endOfDay(NDaysAgo) },
  });

  colorfulLog(
    `Deleting ${backups.length} backups older than ${_deleteOlderThan} days`,
    'info'
  );

  backups.forEach(async (backup) => {
    await backup.deleteOne();
  });
});

/**
 * Bootstrap function to run the schedule on server start
 */
export const runSchedule = async () => {
  if (!_runSchedule) {
    colorfulLog('CRON Schedule is disabled', 'warning');
    return;
  }

  reloadSchedule$.next();
};

const _buildSchedule = async () => {
  const jobs = await CronJobModel.find({ enabled: true }).populate('databases');
  console.log(`Found ${jobs.length} jobs to schedule`);

  await asyncForEach(jobs, async (job) => {
    if (!job.expression)
      return colorfulLog(`Job ${job.alias} has no expression`, 'error');
    //for each job, schedule it with node-cron
    cron.schedule(job.expression, async () => {
      //initiate the backup manager
      const _backupManager = await BackupManager.init({ cronJob: job }).catch(
        genericErrorHandler
      );

      //backup the chosen collections
      await _backupManager.startJob().catch((error) => {
        console.log(error);
        colorfulLog('job failed!', 'error');
      });

      //send the backup to the recipient
      // await _backupManager.sendToRecipient().catch(genericErrorHandler);
    });
  });
};
