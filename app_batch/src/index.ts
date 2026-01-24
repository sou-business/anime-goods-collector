import cron from 'node-cron';
import { cospaScrapingJob } from '@/jobs/cospaScraperJob.js';
import schedule_config from '@config/batch_schedule.json' with { type: 'json' };
import { logger } from 'app_common/server';

interface ScheduleConfig {
  schedule: string;
  timezone: string;
}

function loadConfig(): ScheduleConfig {
  const env = (process.env.BATCH_SCHEDULE) as keyof typeof schedule_config;
  if (!(env in schedule_config)) {
    throw new Error(`BATCH_SCHEDULE=${env} は batch_schedule.json に存在しません`);
  }
  return schedule_config[env];
}

async function main() {
  const config: ScheduleConfig = loadConfig();

  // スケジューラー起動
  logger.info(`📅 スケジューラー起動: ${config.schedule} (${config.timezone})`);

  // 起動直後に一度実行
  await cospaScrapingJob();
  
  cron.schedule(config.schedule, async () => {
    logger.info(`⏰ ${new Date().toISOString()} - ジョブ開始`);
    await cospaScrapingJob();
  }, {
    timezone: config.timezone
  });
}

main().catch((err) => {
  logger.error(err.message, err);
  process.exit(1);
});