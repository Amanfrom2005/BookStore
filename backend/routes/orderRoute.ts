import express from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import { multerMiddleware } from "../config/cloudinaryConfig";
import * as orderController from "../controllers/orderController";

const router = express.Router();

router.post("/", authenticatedUser, multerMiddleware, orderController.createOrUpdateOrder);
router.get("/", authenticatedUser, orderController.getOrderByUser);
router.get("/:id", authenticatedUser, orderController.getOrderById);

export default router;
