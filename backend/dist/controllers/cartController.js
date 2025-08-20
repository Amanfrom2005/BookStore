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
exports.getCartByUser = exports.removeFromCart = exports.addToCart = void 0;
const Products_1 = __importDefault(require("../models/Products"));
const responseHandler_1 = require("../utils/responseHandler");
const CartItems_1 = __importDefault(require("../models/CartItems"));
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.id;
        const { productId, quantity } = req.body;
        const product = yield Products_1.default.findById(productId);
        if (!product) {
            return (0, responseHandler_1.response)(res, 404, "Product not found", null);
        }
        if (product.seller.toString() === userId) {
            return (0, responseHandler_1.response)(res, 400, "You cannot add your own product to the cart", null);
        }
        let cart = yield CartItems_1.default.findOne({ user: userId });
        if (!cart) {
            cart = new CartItems_1.default({ user: userId, items: [] });
        }
        const existingItem = cart.items.find(item => item.product.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        }
        else {
            const newItem = { product: productId, quantity: quantity };
            cart.items.push(newItem);
        }
        yield cart.save();
        return (0, responseHandler_1.response)(res, 200, "item added to Cart successfully", cart);
    }
    catch (error) {
        console.error(error);
        (0, responseHandler_1.response)(res, 500, "Internal server error", null);
    }
});
exports.addToCart = addToCart;
const removeFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.id;
        const { productId } = req.params;
        let cart = yield CartItems_1.default.findOne({ user: userId });
        if (!cart) {
            return (0, responseHandler_1.response)(res, 404, "Cart not found", null);
        }
        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        yield cart.save();
        return (0, responseHandler_1.response)(res, 200, "Item removed from cart", cart);
    }
    catch (error) {
        console.error(error);
        (0, responseHandler_1.response)(res, 500, "Internal server error", null);
    }
});
exports.removeFromCart = removeFromCart;
const getCartByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        let cart = yield CartItems_1.default.findOne({ user: userId }).populate("items.product");
        if (!cart) {
            return (0, responseHandler_1.response)(res, 404, "Cart is empty", { items: [] });
        }
        return (0, responseHandler_1.response)(res, 200, "Cart retrieved successfully", cart);
    }
    catch (error) {
        console.error(error);
        (0, responseHandler_1.response)(res, 500, "Internal server error", null);
    }
});
exports.getCartByUser = getCartByUser;
