import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export function requireRole(allowedRoles: string[]) {
  const allowedSet = new Set(allowedRoles.map((r) => r.toLowerCase()));

  return (req: Request, res: Response, next: NextFunction): void => {
    const role = (req.headers["x-user-role"] as string)?.trim()?.toLowerCase();
    if (!role || !allowedSet.has(role)) {
      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Forbidden: insufficient role",
        error: { code: "FORBIDDEN" },
      });
      return;
    }
    next();
  };
}
