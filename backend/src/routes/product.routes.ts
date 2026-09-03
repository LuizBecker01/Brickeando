import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const productRoutes = Router();

productRoutes.get("/products", productController.listProducts);
productRoutes.get("/products/:id", productController.getProductById);
productRoutes.post("/products", authMiddleware, productController.createProduct);
productRoutes.patch("/products/:id", authMiddleware, productController.updateProduct);
productRoutes.delete("/products/:id", authMiddleware, productController.deleteProduct);
