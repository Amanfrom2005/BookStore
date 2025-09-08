import { Request, Response } from "express";
import { response } from "../utils/responseHandler";
import { uploadToCloudinary } from "../config/cloudinaryConfig";
import Products from "../models/Products";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
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
      paymentDetails,
    } = req.body;

    const sellerId = req.id;
    const images = req.files as Express.Multer.File[];
    if (!images || images.length === 0) {return response(res, 400, "images is required");}
    let parsedPaymentDetails = JSON.parse(paymentDetails);
    if (paymentMode === "UPI" && (!parsedPaymentDetails || !parsedPaymentDetails.upiId)) {
      return response(res, 400, "UPI ID is required for payments");
    }

    if (paymentMode === "Bank Account" &&(!parsedPaymentDetails || !parsedPaymentDetails.bankDetails || !parsedPaymentDetails.bankDetails.accountNumber || !parsedPaymentDetails.bankDetails.ifscCode || !parsedPaymentDetails.bankDetails.bankName)) {
      return response(res, 400, "Bank details are required for payments");
    }

    const uploadPromise = images.map(file => uploadToCloudinary(file as any));
    const uploadImages = await Promise.all(uploadPromise);
    const imagesUrls = uploadImages.map((image) => image.secure_url);
    const product = new Products({
        title,
        subject,
        category,
        condition,
        classType,
        price,
        finalPrice,
        paymentDetails: parsedPaymentDetails,
        author,
        edition,
        description,
        shippingCharge,
        paymentMode,
        seller: sellerId,
        images: imagesUrls,
    });

    await product.save();

    return response(res, 200, "Product created successfully", product);

  } catch (error) {
    console.log(error);
    response(res, 500, "Internal server error", null);
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await Products.find().sort({ createdAt: -1 }).populate('seller', 'name email');
        return response(res, 200, "Products fetched successfully", products);
    } catch (error) {
        console.log(error);
        response(res, 500, "Internal server error");
    }
}

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await Products.findById(req.params.id)
        .populate({
            path: 'seller',
            select: 'name email profilePicture phoneNumber addresses',
            populate: {path: 'addresses',model: 'Address'}
        });
        if (!product) {return response(res, 404, "Product not found");}
        return response(res, 200, "Product fetched by Id successfully", product);
    } catch (error) {
        console.error(error);
        response(res, 500, "Internal server error");
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Products.findByIdAndDelete(req.params.productId);
        if (!product) {return response(res, 404, "Product not found for this seller");}
        return response(res, 200, "Product deleted successfully");
    } catch (error) {
        console.error(error);
        response(res, 500, "Internal server error");
    }
}

export const getProductBySellerId = async (req: Request, res: Response) => {
    try {
        const sellerId = req.params.sellerId;
        if(!sellerId){return response(res, 400, "Seller ID is required");}
        const products = await Products.find({ seller: sellerId }).sort({ createdAt: -1 }).populate('seller', 'name email profilePicture phoneNumber addresses');
        if(!products || products.length === 0) {return response(res, 404, "No products found for this seller");}
        return response(res, 200, "Products fetched by seller Id successfully", products);
    } catch (error) {
        console.error(error);
        response(res, 500, "Internal server error");
    }
}