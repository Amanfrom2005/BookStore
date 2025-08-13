import express from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import * as wishListController from "../controllers/wishListController";

const router = express.Router();

router.post("/add", authenticatedUser, wishListController.addToWishList);
router.delete("/remove/:productId", authenticatedUser, wishListController.removeFromWishList);
router.get("/user/:userId", authenticatedUser, wishListController.getWishListByUser);

export default router;
