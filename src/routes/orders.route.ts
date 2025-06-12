import express from "express";
import * as OrderController from "../controllers/orders.controller";
import authMiddleware from "../middlewares/auth.middleware";
import authorizeRole from "../middlewares/role.middleware";

const router = express.Router();

router.post(
  "/create-transaction",
  authMiddleware,
  OrderController.createTransaction
);

router.post('/payments/notification', OrderController.handlePaymentNotification);

router.get(
  "/",
  authMiddleware,
  authorizeRole(["ADMIN"]),
  OrderController.getOrders
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRole(["ADMIN"]),
  OrderController.getOrderById
);

export default router;