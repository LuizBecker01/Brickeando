import { Router } from "express";
import { productController } from "../controllers/product.controller";

export const productRoutes = Router();

productRoutes.get("/products", productController.listProducts);
productRoutes.get("/products/:id", productController.getProductById);
productRoutes.post("/products", productController.createProduct);
productRoutes.patch("/products/:id", productController.updateProduct);
productRoutes.delete("/products/:id", productController.deleteProduct);
