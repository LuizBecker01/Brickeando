import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/app-error";
import { HttpStatus } from "../errors/http-status";

const JWT_SECRET = process.env.JWT_SECRET ?? "brickeando-dev-secret";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    next(new AppError("Token de autenticação ausente ou inválido.", HttpStatus.UNPROCESSABLE_ENTITY));
    return;
  }

  const token = authorizationHeader.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; email: string };

    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    next();
  } catch (_error) {
    next(new AppError("Token de autenticação inválido.", HttpStatus.UNPROCESSABLE_ENTITY));
  }
};
