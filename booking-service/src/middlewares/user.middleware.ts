import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../utils/api-error";

export function attachUserFromHeaders(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const userIdHeader = (req.headers["x-user-id"] as string)?.trim();
  if (!userIdHeader) {
    next(new UnauthorizedError("Missing or invalid X-User-ID header"));
    return;
  }
  const userId = parseInt(userIdHeader, 10);
  if (isNaN(userId) || userId <= 0) {
    next(new UnauthorizedError("Invalid X-User-ID header"));
    return;
  }
  const email = (req.headers["x-user-email"] as string)?.trim() ?? "";
  const role = (req.headers["x-user-role"] as string)?.trim() ?? "";
  req.user = { id: userId, email, role };
  next();
}
