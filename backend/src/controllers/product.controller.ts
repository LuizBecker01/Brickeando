import { NextFunction, Request, Response } from "express";
import { productService } from "../services/product.service";

export const productController = {
  async listProducts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const numberQuery = (value: unknown) => {
        if (typeof value !== "string" || value.trim() === "") return undefined;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
      };
      const products = await productService.listProducts({
        status:
          typeof req.query.status === "string" ? req.query.status : undefined,
        categoryId:
          typeof req.query.categoryId === "string"
            ? req.query.categoryId
            : undefined,
        minPrice: numberQuery(req.query.minPrice),
        maxPrice: numberQuery(req.query.maxPrice),
        latitude: numberQuery(req.query.latitude),
        longitude: numberQuery(req.query.longitude),
        radiusKm: numberQuery(req.query.radiusKm),
      });
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  },

  async listCategories(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const categories = await productService.listCategories();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  },

  async getProductById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const product = await productService.getProductById(req.params.id);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },

  async createProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const payload = {
        ...req.body,
        sellerId: req.user?.id,
      };

      const product = await productService.createProduct(payload);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  },

  async updateProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        throw new Error("Usuário não autenticado.");
      }

      const product = await productService.updateProduct(
        req.params.id,
        req.body,
        currentUserId,
      );
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },

  async deleteProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
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
