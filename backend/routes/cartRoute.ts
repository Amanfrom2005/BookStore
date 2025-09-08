import express from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import * as cartController from "../controllers/cartController";

const router = express.Router();

router.post("/add", authenticatedUser, cartController.addToCart);
router.get("/:userId", authenticatedUser, cartController.getCartByUser);
router.delete("/remove/:productId", authenticatedUser, cartController.removeFromCart);

export default router;
