import express from "express";
import * as OrderController from "../controllers/orders.controller";
import authMiddleware from "../middlewares/auth.middleware";
import authorizeRole from "../middlewares/role.middleware";

const router = express.Router();

// Create new order transaction
router.post(
  "/create-transaction",
  authMiddleware,
  OrderController.createTransaction
);

// Payment notification handler (no auth needed as it's called by Midtrans)
router.post('/payments/notification', OrderController.handlePaymentNotification);

// Get user's orders
router.get(
  "/",
  authMiddleware,
  authorizeRole(["ADMIN"]),
  OrderController.getOrders
);

// Get specific order details
router.get(
  "/:id",
  authMiddleware,
  authorizeRole(["ADMIN"]),
  OrderController.getOrderById
);

export default router;