import express from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import * as cartController from "../controllers/cartController";

const router = express.Router();

router.post("/add", authenticatedUser, cartController.addToCart);
router.delete("/remove/:productId", authenticatedUser, cartController.removeFromCart);
router.get("/user/:userId", authenticatedUser, cartController.getCartByUser);

export default router;
