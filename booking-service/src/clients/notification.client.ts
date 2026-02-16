import { serverConfig } from "../config";

export interface SendNotificationPayload {
  to: string;
  subject: string;
  templateId: string;
  params?: Record<string, unknown>;
}

/**
 * Calls notification-service to enqueue an email (e.g. reservation confirmation).
 * Returns when the notification is accepted (202); actual send is async in the worker.
 */
export async function sendNotification(
  payload: SendNotificationPayload
): Promise<void> {
  const baseUrl = serverConfig.NOTIFICATION_SERVICE_URL.replace(/\/$/, "");
  const url = `${baseUrl}/api/v1/notifications/send`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: payload.to,
      subject: payload.subject,
      templateId: payload.templateId,
      params: payload.params ?? {},
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Notification service failed: ${res.status} ${text}`
    );
  }
}
