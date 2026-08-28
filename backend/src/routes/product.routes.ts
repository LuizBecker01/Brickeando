import { Router } from "express";
import { productController } from "../controllers/product.controller";

export const productRoutes = Router();

productRoutes.get("/products", productController.index);
productRoutes.get("/products/:id", productController.show);
productRoutes.post("/products", productController.store);
