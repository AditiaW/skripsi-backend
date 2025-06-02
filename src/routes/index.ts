import { Router } from "express";
import {
  forgotPassword,
  loginUser,
  resetPassword,
  createUser,
  verifyEmail,
} from "../controllers/user.controller";
import validateSchema from "../middlewares/validation.middleware";
import { createUserSchema } from "../schemas/user.schema";
import prisma from "../lib/client";
import authMiddleware from "../middlewares/auth.middleware";
import userRoute from "./user.route";
import categoryRoute from "./category.route";
import productRoute from "./product.route";
import orderRoute from "./orders.route";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ 
    message: "Welcome to GM Candra Mebel API",
    status: "healthy",
    version: "1.0.0" 
  });
});

router.post("/register", validateSchema(createUserSchema), createUser);
router.get('/verify-email/:token', verifyEmail);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

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
