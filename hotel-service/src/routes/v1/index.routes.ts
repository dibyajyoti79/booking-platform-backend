import express from "express";
import pingRouter from "./ping.routes";
import hotelRouter from "./hotel.routes";
import roomTypeRouter from "./roomType.routes";
import inventoryRouter from "./inventory.routes";
import rateRouter from "./rate.routes";

const v1Router = express.Router();

v1Router.use("/ping", pingRouter);
v1Router.use("/hotels", hotelRouter);
v1Router.use("/room-types", roomTypeRouter);
v1Router.use("/inventories", inventoryRouter);
v1Router.use("/rates", rateRouter);

export default v1Router;
