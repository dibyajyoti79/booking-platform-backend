import express from "express";
import pingRouter from "./ping.routes";
import bookingRouter from "./booking.routes";

const v1Router = express.Router();

v1Router.use("/ping", pingRouter);
v1Router.use("/booking", bookingRouter);

export default v1Router;
