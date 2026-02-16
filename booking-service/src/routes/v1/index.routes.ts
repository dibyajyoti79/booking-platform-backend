import express from "express";
import pingRouter from "./ping.routes";
import reservationRouter from "./reservation.routes";

const v1Router = express.Router();

v1Router.use("/ping", pingRouter);
v1Router.use("/reservation", reservationRouter);

export default v1Router;
