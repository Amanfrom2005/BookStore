import express from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import { multerMiddleware } from "../config/cloudinaryConfig";
import * as productController from "../controllers/productController";

const router = express.Router();

router.post("/", authenticatedUser, multerMiddleware, productController.createProduct);
router.get("/", authenticatedUser, productController.getAllProducts);
router.get("/:id", authenticatedUser, productController.getProductById);
router.get("/seller/:sellerId", authenticatedUser, productController.getProductBySellerId);
router.delete("/seller/:productId", authenticatedUser, productController.deleteProduct);

export default router;
