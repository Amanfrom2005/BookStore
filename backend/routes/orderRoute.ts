import express from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import * as orderController from "../controllers/orderController";

const router = express.Router();

router.post("/", authenticatedUser, orderController.createOrUpdateOrder);
router.post("/payment-razorpay", authenticatedUser, orderController.createPaymentWithRazorpay);
router.post("/razorpay-webhook", authenticatedUser, orderController.handleRazorPayWebhook);
router.get("/", authenticatedUser, orderController.getOrderByUser);
router.get("/:id", authenticatedUser, orderController.getOrderById);

export default router;
