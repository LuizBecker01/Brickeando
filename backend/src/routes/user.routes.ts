import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const userRoutes = Router();

userRoutes.post("/users/register", userController.register);
userRoutes.post("/users/login", userController.login);
userRoutes.post("/users/google", userController.googleLogin);
userRoutes.get("/users/me", authMiddleware, userController.profile);
