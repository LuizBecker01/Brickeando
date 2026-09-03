import { NextFunction, Request, Response } from "express";
import { productService } from "../services/product.service";

export const productController = {
  async listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = typeof req.query.status === "string" ? req.query.status : undefined;
      const products = await productService.listProducts(status);
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  },

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getProductById(req.params.id);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },

  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = {
        ...req.body,
        sellerId: req.user?.id ?? req.body?.sellerId,
      };

      const product = await productService.createProduct(payload);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  },

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        throw new Error("Usuário não autenticado.");
      }

      const product = await productService.updateProduct(req.params.id, req.body, currentUserId);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        throw new Error("Usuário não autenticado.");
      }

      await productService.deleteProduct(req.params.id, currentUserId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
