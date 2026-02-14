import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../config/logger.config";
import { mailerQueue } from "../queues/mailer.queue";
import { MAILER_PAYLOAD } from "../processors/email.processor";
import { ApiResponse } from "../utils/api-response";

/**
 * Receives email payload and enqueues it for async processing.
 * Returns 202 Accepted immediately; actual send happens in the worker.
 */
export const sendNotificationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { to, subject, templateId, params } = req.body;

  await mailerQueue.add(
    MAILER_PAYLOAD,
    { to, subject, templateId, params: params ?? {} },
    { attempts: 3, backoff: { type: "exponential", delay: 1000 } }
  );

  logger.info(`Enqueued email for ${to}, subject: ${subject}`);

  res.status(StatusCodes.ACCEPTED).json(
    new ApiResponse("Notification queued for delivery", { to, subject })
  );
};
