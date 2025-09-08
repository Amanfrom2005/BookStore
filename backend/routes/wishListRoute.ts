import express from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import * as wishListController from "../controllers/wishListController";

const router = express.Router();

router.post("/add", authenticatedUser, wishListController.addToWishList);
router.get("/:userId", authenticatedUser, wishListController.getWishListByUser);
router.delete("/remove/:productId", authenticatedUser, wishListController.removeFromWishList);

export default router;
