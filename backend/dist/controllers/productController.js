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
exports.getProductBySellerId = exports.deleteProduct = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const cloudinaryConfig_1 = require("../config/cloudinaryConfig");
const Products_1 = __importDefault(require("../models/Products"));
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, subject, category, condition, classType, price, finalPrice, author, edition, description, shippingCharge, paymentMode, paymentDetails, } = req.body;
        const sellerId = req.id;
        const images = req.files;
        if (!images || images.length === 0) {
            return (0, responseHandler_1.response)(res, 400, "images is required", null);
        }
        let parsedPaymentDetails = JSON.parse(paymentDetails);
        if (paymentMode === "UPI" &&
            (!parsedPaymentDetails || !parsedPaymentDetails.upiId)) {
            return (0, responseHandler_1.response)(res, 400, "UPI ID is required for payments", null);
        }
        if (paymentMode === "Bank Account" &&
            (!parsedPaymentDetails ||
                !parsedPaymentDetails.bankDetails ||
                !parsedPaymentDetails.bankDetails.accountNumber ||
                !parsedPaymentDetails.bankDetails.ifscCode ||
                !parsedPaymentDetails.bankDetails.bankName)) {
            return (0, responseHandler_1.response)(res, 400, "Bank details are required for payments", null);
        }
        const uploadPromise = images.map((file) => (0, cloudinaryConfig_1.uploadToCloudinary)(file));
        const uploadImages = yield Promise.all(uploadPromise);
        const imagesUrls = uploadImages.map((image) => image.secure_url);
        const product = new Products_1.default({
            title,
            subject,
            category,
            condition,
            classType,
            price,
            finalPrice,
            author,
            edition,
            description,
            shippingCharge,
            paymentMode,
            // paymentDetails: parsedPaymentDetails,
            seller: sellerId,
            images: imagesUrls,
        });
        yield product.save();
        return (0, responseHandler_1.response)(res, 200, "Product created successfully", product);
    }
    catch (error) {
        console.error(error);
        (0, responseHandler_1.response)(res, 500, "Internal server error", null);
    }
});
exports.createProduct = createProduct;
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield Products_1.default.find().sort({ createdAt: -1 }).populate('seller', 'name email');
        return (0, responseHandler_1.response)(res, 200, "Products fetched successfully", products);
    }
    catch (error) {
        console.error(error);
        (0, responseHandler_1.response)(res, 500, "Internal server error", null);
    }
});
exports.getAllProducts = getAllProducts;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Products_1.default.findById(req.params.id)
            .populate({
            path: 'seller',
            select: 'name email profilePicture phoneNumber addresses',
            populate: {
                path: 'addresses',
                model: 'Address'
            }
        });
        if (!product) {
            return (0, responseHandler_1.response)(res, 404, "Product not found", null);
        }
        return (0, responseHandler_1.response)(res, 200, "Product fetched by Id successfully", product);
    }
    catch (error) {
        console.error(error);
        (0, responseHandler_1.response)(res, 500, "Internal server error", null);
    }
});
exports.getProductById = getProductById;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Products_1.default.findByIdAndDelete(req.params.productId);
        if (!product) {
            return (0, responseHandler_1.response)(res, 404, "Product not found for this seller", null);
        }
        return (0, responseHandler_1.response)(res, 200, "Product deleted successfully", null);
    }
    catch (error) {
        console.error(error);
        (0, responseHandler_1.response)(res, 500, "Internal server error", null);
    }
});
exports.deleteProduct = deleteProduct;
const getProductBySellerId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sellerId = req.params.sellerId;
        if (!sellerId) {
            return (0, responseHandler_1.response)(res, 400, "Seller ID is required", null);
        }
        const products = yield Products_1.default.find({ seller: sellerId }).sort({ createdAt: -1 }).populate('seller', 'name email profilePicture phoneNumber addresses');
        if (!products || products.length === 0) {
            return (0, responseHandler_1.response)(res, 404, "No products found for this seller", null);
        }
        return (0, responseHandler_1.response)(res, 200, "Products fetched by seller Id successfully", products);
    }
    catch (error) {
        console.error(error);
        (0, responseHandler_1.response)(res, 500, "Internal server error", null);
    }
});
exports.getProductBySellerId = getProductBySellerId;
