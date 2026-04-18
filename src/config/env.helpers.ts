let envLoaded = false;

function ensureEnvLoaded() {
  if (envLoaded) {
    return;
  }

  process.loadEnvFile?.();
  envLoaded = true;
}

export function isNotificationsQueueEnabled() {
  ensureEnvLoaded();

  const queueFlag = process.env.NOTIFICATIONS_QUEUE_ENABLED?.toLowerCase();

  if (queueFlag === 'true') {
    return true;
  }

  if (queueFlag === 'false') {
    return false;
  }

  return Boolean(process.env.REDIS_URL);
}
