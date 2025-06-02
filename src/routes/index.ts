import { Router } from "express";
import {
  forgotPassword,
  loginUser,
  resetPassword,
  createUser,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/user.controller";
import validateSchema from "../middlewares/validation.middleware";
import { createUserSchema } from "../schemas/user.schema";
import prisma from "../lib/client";
import authMiddleware from "../middlewares/auth.middleware";
import userRoute from "./user.route";
import categoryRoute from "./category.route";
import productRoute from "./product.route";
import orderRoute from "./orders.route";
import rateLimit from "express-rate-limit";

const router = Router();

// Rate limit settings
const resendLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 3,
  message: "Too many requests, please try again later.",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  message: "Too many login attempts, please try again later.",
});

const resetLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  message: "Too many reset password attempts, please try again later.",
});

router.get("/", (_req, res) => {
  res.json({ 
    message: "Welcome to GM Candra Mebel API",
    status: "healthy",
    version: "1.0.0" 
  });
});

router.post("/register", validateSchema(createUserSchema), createUser);
router.get('/verify-email/:token', verifyEmail);
router.post("/resend-verification", resendLimiter, resendVerificationEmail);
router.post("/login", authLimiter, loginUser);
router.post("/forgot-password", resetLimiter, forgotPassword);
router.post("/reset-password", resetLimiter, resetPassword);

router.use("/users", userRoute);
router.use("/category", categoryRoute);
router.use("/product", productRoute);
router.use("/orders", orderRoute);

router.post("/users/fcm-token", authMiddleware, async (req, res) => {
    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { fcmToken: req.body.token }
        });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("[Error] Failed to update FCM token:", error);
        res.status(500).json({ error: "Failed to update FCM token" });
    }
});

export default router;
