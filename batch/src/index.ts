import cron from 'node-cron';
import { cospaScrapingJob } from '@/jobs/cospaScraperJob.js';
import shedule_config from '@config/batch_schedule.json';
import { logger } from './utils/logger';

interface ScheduleConfig {
  schedule: string;
  timezone: string;
}

function loadConfig(): ScheduleConfig {
  const env = (process.env.BATCH_SCHEDULE) as keyof typeof shedule_config;
  if (!(env in shedule_config)) {
    throw new Error(`BATCH_SCHEDULE=${env} は batch_schedule.json に存在しません`);
  }
  return shedule_config[env];
}

async function main() {
  const config: ScheduleConfig = loadConfig();

  // スケジューラー起動
  logger.info(`📅 スケジューラー起動: ${config.schedule} (${config.timezone})`);
  
  cron.schedule(config.schedule, async () => {
    logger.info(`⏰ ${new Date().toISOString()} - ジョブ開始`);
    await cospaScrapingJob();
  }, {
    timezone: config.timezone
  });
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});