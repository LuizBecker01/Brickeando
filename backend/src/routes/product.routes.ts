import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ownershipMiddleware } from "../middlewares/ownership.middleware";

export const productRoutes = Router();

productRoutes.get("/products", productController.listProducts);
productRoutes.get("/categories", productController.listCategories);
productRoutes.get("/products/:id", productController.getProductById);
productRoutes.post(
  "/products",
  authMiddleware,
  productController.createProduct,
);
productRoutes.put(
  "/products/:id",
  authMiddleware,
  ownershipMiddleware,
  productController.updateProduct,
);
productRoutes.patch(
  "/products/:id",
  authMiddleware,
  ownershipMiddleware,
  productController.updateProduct,
);
productRoutes.delete(
  "/products/:id",
  authMiddleware,
  ownershipMiddleware,
  productController.deleteProduct,
);
