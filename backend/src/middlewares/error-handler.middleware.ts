import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

export const errorHandlerMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details ?? null,
    });
    return;
  }

  if (error instanceof Error) {
    console.error("Unhandled application error:", error);
    res.status(500).json({
      message: "Erro interno do servidor.",
      details: null,
    });
    return;
  }

  console.error("Unknown error:", error);
  res.status(500).json({
    message: "Erro interno do servidor.",
    details: null,
  });
};
