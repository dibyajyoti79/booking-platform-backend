import express from "express";
import pingRouter from "./ping.routes";
import hotelRouter from "./hotel.routes";
import roomTypeRouter from "./roomType.routes";

const v1Router = express.Router();

v1Router.use("/ping", pingRouter);
v1Router.use("/hotels", hotelRouter);
v1Router.use("/room-types", roomTypeRouter);

export default v1Router;
