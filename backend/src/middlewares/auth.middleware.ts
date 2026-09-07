import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { HttpStatus } from "../errors/http-status";
import { verifyAppToken } from "../utils/jwt";

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    next(
      new AppError(
        "Token de autenticação ausente ou inválido.",
        HttpStatus.UNAUTHORIZED,
      ),
    );
    return;
  }

  const token = authorizationHeader.replace("Bearer ", "");

  try {
    const payload = verifyAppToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name ?? "Usuário",
    };

    next();
  } catch (_error) {
    next(
      new AppError(
        "Token de autenticação inválido ou expirado.",
        HttpStatus.UNAUTHORIZED,
      ),
    );
  }
};
