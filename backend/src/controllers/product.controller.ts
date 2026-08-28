import { Request, Response } from "express";
import { productService } from "../services/product.service";

export const productController = {
  index: async (_req: Request, res: Response) => {
    const products = await productService.listAvailableProducts();
    res.json(products);
  },

  show: async (req: Request, res: Response) => {
    try {
      const product = await productService.getProductDetails(req.params.id);
      res.json(product);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  },

  store: async (req: Request, res: Response) => {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
};
