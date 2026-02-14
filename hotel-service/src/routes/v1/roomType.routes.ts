import { Router } from "express";
import {
  createRoomType,
  deleteRoomType,
  getRoomTypeById,
  getRoomTypes,
  updateRoomType,
} from "../../controllers/roomType.controller";
import { requireRole } from "../../middlewares/authorize.middleware";
import {
  validateParams,
  validateRequestBody,
} from "../../validators/index";
import {
  roomTypeIdSchema,
  roomTypeSchema,
  roomTypeUpdateSchema,
} from "../../validators/roomType.validator";

const roomTypeRouter = Router();

const hostOnly = requireRole(["host"]);

roomTypeRouter.get("/", getRoomTypes);
roomTypeRouter.get("/:id", validateParams(roomTypeIdSchema), getRoomTypeById);
roomTypeRouter.post(
  "/",
  hostOnly,
  validateRequestBody(roomTypeSchema),
  createRoomType
);
roomTypeRouter.put(
  "/:id",
  hostOnly,
  validateParams(roomTypeIdSchema),
  validateRequestBody(roomTypeUpdateSchema),
  updateRoomType
);
roomTypeRouter.delete(
  "/:id",
  hostOnly,
  validateParams(roomTypeIdSchema),
  deleteRoomType
);

export default roomTypeRouter;
