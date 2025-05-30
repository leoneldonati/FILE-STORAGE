import { Router } from "express";
import {
  getProductById,
  getProductsByLimit,
  setProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.js";
export const productRoutes = Router();

productRoutes.get("/products", getProductsByLimit);
productRoutes.get("/products/:id", getProductById);
productRoutes.post("/products", setProduct);
productRoutes.patch("/products/:id", updateProduct);
productRoutes.delete("/products/:id", deleteProduct);
