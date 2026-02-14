import { z } from "zod";

export const sendNotificationSchema = z.object({
  to: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  templateId: z.string().min(1, "Template ID is required"),
  params: z.record(z.unknown()).optional().default({}),
});

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
