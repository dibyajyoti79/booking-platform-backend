import logger from "../config/logger.config";
import { NotificationDto } from "../dtos/notification.dto";
import { mailerQueue } from "../queues/mailer.queue";

export const MAILER_PAYLOAD = "payload:mail";

export const addEmailToQueue = async (payload: NotificationDto) => {
  await mailerQueue.add(MAILER_PAYLOAD, payload);
  logger.info(`Email added to queue: ${JSON.stringify(payload)}`);
};
