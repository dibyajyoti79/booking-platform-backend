import { Job, Worker } from "bullmq";
import { MAILER_QUEUE } from "../queues/mailer.queue";
import { getRedisConnObject } from "../config/redis.config";
import logger from "../config/logger.config";
import { NotificationDto } from "../dto/notification.dto";
import { renderMailTemplate } from "../templates/templates.handler";
import { sendEmail } from "../services/mailer.service";

export const MAILER_PAYLOAD = "payload:mail";

export const setupMailerWorker = () => {
  const emailProcessor = new Worker<NotificationDto>(
    MAILER_QUEUE,
    async (job: Job) => {
      if (job.name !== MAILER_PAYLOAD) {
        throw new Error("Invalid job name");
      }

      const payload = job.data;
      logger.info(
        `Processing email for: ${payload.to}, template: ${payload.templateId}`,
      );

      const emailContent = await renderMailTemplate(
        payload.templateId,
        payload.params ?? {},
      );

      await sendEmail(payload.to, payload.subject, emailContent);
      logger.info(
        `Rendered email (${payload.templateId}) to ${payload.to}: "${payload.subject}"`,
      );
      logger.debug(emailContent);
    },
    {
      connection: getRedisConnObject(),
    },
  );

  emailProcessor.on(
    "failed",
    (job: Job<NotificationDto> | undefined, error: Error) => {
      if (!job) {
        logger.error("Email processing failed: No job data available");
        return;
      }
      logger.error(
        `Email processing failed: ${error.message} ${JSON.stringify(job.data)}`,
      );
    },
  );

  emailProcessor.on("completed", (job: Job<NotificationDto>) => {
    logger.info(
      `Email processing completed successfully: ${JSON.stringify(job.data)}`,
    );
  });
};
