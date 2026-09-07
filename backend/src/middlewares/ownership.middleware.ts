import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { HttpStatus } from "../errors/http-status";
import { productRepository } from "../repositories/product.repository";

export const ownershipMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await productRepository.findById(req.params.id);

    if (!product) {
      next(new AppError("Produto não encontrado.", HttpStatus.NOT_FOUND));
      return;
    }

    if (!req.user || product.sellerId !== req.user.id) {
      next(
        new AppError(
          "Você só pode alterar seus próprios produtos.",
          HttpStatus.FORBIDDEN,
        ),
      );
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
