import express from "express";
import { sendNotificationHandler } from "../../controllers/notification.controller";
import { validateRequestBody } from "../../validators";
import { sendNotificationSchema } from "../../validators/notification.validator";

const notificationRouter = express.Router();

notificationRouter.post(
  "/send",
  validateRequestBody(sendNotificationSchema),
  sendNotificationHandler
);

export default notificationRouter;
