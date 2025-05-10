import express from "express";
import * as OrderController from "../controllers/orders.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = express.Router();

router.post(
  "/create-transaction",
  authMiddleware,
  OrderController.createTransaction
);
router.post('/payments/notification', OrderController.handlePaymentNotification);

export default router;