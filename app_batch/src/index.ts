import cron from 'node-cron';
import schedule_config from '@config/batch_schedule.json' with { type: 'json' };
import { logger, CACHE_KEYS, cacheDelete} from 'app_common/server';
import { jobs } from '@/jobs/index.js';


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

async function executeJobs() {
  await cacheDelete(CACHE_KEYS.PRODUCTS);
  for (const job of jobs) {
    await job();
  }
}

async function runBatchCycle() {
  // 各バッチのキャッシュに最新の商品情報法をマージするため、開始前にクリア
  await cacheDelete(CACHE_KEYS.PRODUCTS);
  await executeJobs();
}

async function main() {
  const config: ScheduleConfig = loadConfig();

  logger.info(`📅 スケジューラー起動: ${config.schedule} (${config.timezone})`);

  await runBatchCycle();
  
  cron.schedule(config.schedule, async () => {
    logger.info(`⏰ ${new Date().toISOString()} - ジョブ開始`);
    await runBatchCycle();
  }, {
    timezone: config.timezone
  });
}

main().catch((err) => {
  logger.error(err.message, err);
  process.exit(1);
});