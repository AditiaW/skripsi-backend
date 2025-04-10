import { Router } from "express";
import userRoute from "./user.route";
import categoryRoute from "./category.route";
import productRoute from "./product.route";
import { forgotPassword, loginUser, resetPassword, createUser } from "../controllers/user.controller";
import validateSchema from "../middlewares/validation.middleware";
import { createUserSchema } from "../schemas/user.schema";

const router = Router();

// Home route
router.get('/', (_req, res) => {
    res.send('Hello, Welcome to GM Candra Mebel API!');
});

// User routes
router.use('/users', userRoute);

// Category routes
router.use('/category', categoryRoute);

// Product routes
router.use('/product', productRoute);

// Auth routes
router.post('/forgot-password', forgotPassword);
router.post('/register', createUser, validateSchema(createUserSchema));
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);

export default router;
