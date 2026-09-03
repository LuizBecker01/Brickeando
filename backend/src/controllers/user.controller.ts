import { NextFunction, Request, Response } from "express";
import { userService } from "../services/user.service";

export const userController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.register(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { credential } = req.body as { credential?: string };
      const result = await userService.loginWithGoogle(credential ?? "");
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async profile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Usuário não autenticado." });
        return;
      }

      const profile = await userService.getProfile(userId);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  },
};
