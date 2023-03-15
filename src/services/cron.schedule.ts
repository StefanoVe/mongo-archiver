import * as cron from 'node-cron';
import { CronJobModel } from '../models/cron-job.js';
import { asyncForEach } from './service.utils.js';

export const runSchedule = async () => {
  const jobs = await CronJobModel.find({ enabled: true }).populate('databases');

  console.log(`Found ${jobs.length} jobs to schedule`);

  await asyncForEach(jobs, async (job) => {
    //for each job, schedule it with node-cron
    cron.schedule(job.cronJob, async () => {
      console.log('job started');
    });
  });
};
