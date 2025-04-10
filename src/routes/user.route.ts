import { Router } from "express";
import {
    deleteUser,
    getUser,
    getUsers,
    updateUser,
} from "../controllers/user.controller";
import validateSchema from "../middlewares/validation.middleware"
import { updateUserSchema } from "../schemas/user.schema";
import authMiddleware from "../middlewares/auth.middleware";
import authorizeRole from "../middlewares/role.middleware";

const userRoute = Router();

userRoute
    .get("", authMiddleware, authorizeRole(["ADMIN"]), getUsers)
    .get("/:userid", authMiddleware, authorizeRole(["ADMIN"]), getUser)
    .delete("/:userid", authMiddleware, authorizeRole(["ADMIN"]), deleteUser)
    .patch("/:userid", authMiddleware, authorizeRole(["ADMIN"]), validateSchema(updateUserSchema), updateUser)

export default userRoute;