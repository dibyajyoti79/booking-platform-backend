import express from "express";
import notificationRouter from "./notification.routes";
import pingRouter from "./ping.routes";

const v1Router = express.Router();

v1Router.use("/ping", pingRouter);
v1Router.use("/notifications", notificationRouter);

export default v1Router;
