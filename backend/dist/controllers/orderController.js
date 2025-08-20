"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRazorPayWebhook = exports.createPaymentWithRazorpay = exports.getOrderById = exports.getOrderByUser = exports.createOrUpdateOrder = void 0;
const CartItems_1 = __importDefault(require("../models/CartItems"));
const responseHandler_1 = require("../utils/responseHandler");
const Order_1 = __importDefault(require("../models/Order"));
const razorpay_1 = __importDefault(require("razorpay"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config();
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const createOrUpdateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.id;
        const { orderId, shippingAddress, paymentMethod, paymentDetails, totalAmount, } = req.body;
        const cart = yield CartItems_1.default.findOne({ user: userId }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            return (0, responseHandler_1.response)(res, 400, "Cart is empty", null);
        }
        let order = yield Order_1.default.findOne({ _id: orderId });
        if (order) {
            order.shippingAddress = shippingAddress || order.shippingAddress;
            order.paymentMethod = paymentMethod || order.paymentMethod;
            order.totalAmount = totalAmount || order.totalAmount;
            if (paymentDetails) {
                order.paymentDetails = paymentDetails;
                order.paymentStatus = "completed";
                order.status = "processing";
            }
        }
        else {
            order = new Order_1.default({
                user: userId,
                items: cart.items,
                totalAmount,
                shippingAddress,
                paymentMethod,
                paymentDetails,
                paymentStatus: paymentDetails ? "completed" : "pending",
            });
        }
        yield order.save();
        if (paymentDetails) {
            yield CartItems_1.default.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
        }
        return (0, responseHandler_1.response)(res, 200, "Order created/updated successfully", order);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.response)(res, 500, "Internal Server Error", null);
    }
});
exports.createOrUpdateOrder = createOrUpdateOrder;
const getOrderByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.id;
        const order = yield Order_1.default.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate("user", "name email")
            .populate("shippingAddress")
            .populate({ path: "items.product", model: "Product" });
        if (!order) {
            return (0, responseHandler_1.response)(res, 404, "Order not found", null);
        }
        return (0, responseHandler_1.response)(res, 200, "Order fetched by user successfully", order);
    }
    catch (error) {
        console.error(error);
        (0, responseHandler_1.response)(res, 500, "Internal server error", null);
    }
});
exports.getOrderByUser = getOrderByUser;
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order_1.default.findById(req.params.id)
            .populate("user", "name email")
            .populate("shippingAddress")
            .populate({ path: "items.product", model: "Product" });
        if (!order) {
            return (0, responseHandler_1.response)(res, 404, "Order not found", null);
        }
        return (0, responseHandler_1.response)(res, 200, "Order fetched by Id successfully", order);
    }
    catch (error) {
        console.error(error);
        (0, responseHandler_1.response)(res, 500, "Internal server error", null);
    }
});
exports.getOrderById = getOrderById;
const createPaymentWithRazorpay = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.body;
        const order = yield Order_1.default.findById(orderId);
        if (!order) {
            return (0, responseHandler_1.response)(res, 404, "Order not found", null);
        }
        const razorpayOrder = yield razorpay.orders.create({
            amount: Math.round(order.totalAmount * 100),
            currency: "INR",
            receipt: order === null || order === void 0 ? void 0 : order._id.toString(),
        });
        return (0, responseHandler_1.response)(res, 200, "Payment created successfully", {
            order: razorpayOrder,
        });
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.response)(res, 500, "Internal Server Error", null);
    }
});
exports.createPaymentWithRazorpay = createPaymentWithRazorpay;
const handleRazorPayWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const shasum = crypto_1.default.createHmac("sha256", secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");
        if (digest === req.headers["x-razorpay-signature"]) {
            const paymentId = req.body.payload.payment.entity.id;
            const orderId = req.body.payload.payment.entity.order.id;
            yield Order_1.default.findOneAndUpdate({ "paymentDetails.razorpay_order_id": orderId }, {
                paymentStatus: "completed",
                status: "processing",
                "paymentDetails.razorpay_payment_id": paymentId,
            });
            return (0, responseHandler_1.response)(res, 200, "Webhook handled successfully", null);
        }
        else {
            return (0, responseHandler_1.response)(res, 500, "Internal Server Error", null);
        }
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.response)(res, 500, "Internal Server Error", null);
    }
});
exports.handleRazorPayWebhook = handleRazorPayWebhook;
