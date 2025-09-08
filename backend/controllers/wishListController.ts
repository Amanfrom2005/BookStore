import { Request, Response } from "express";
import Products from "../models/Products";
import { response } from "../utils/responseHandler";
import CartItems, { ICartItem } from "../models/CartItems";
import Wishlist from "../models/WishList";

export const addToWishList = async (req: Request, res: Response) => {
    try {
        const userId = req.id;
        const { productId } = req.body;

        const product = await Products.findById(productId);

        if (!product) {return response(res, 404, "Product not found");}
       
        let wishList = await Wishlist.findOne({ user: userId });
        if(!wishList){wishList = new Wishlist({ user: userId, products: [] });}

        if (!wishList.products.includes(productId)) {
            wishList.products.push(productId);
            await wishList.save();
        }

        return response(res, 200, "Product added to wishList", wishList);
    } catch (error) {
        console.error(error);
        response(res, 500, "Internal server error");
    }
}

export const removeFromWishList = async (req: Request, res: Response) => {
    try {
        const userId = req.id;
        const { productId } = req.params;

        let wishList = await Wishlist.findOne({ user: userId });
        if(!wishList){return response(res, 404, "WishList not found");}

        wishList.products = wishList.products.filter((id) => id.toString() !== productId);
        await wishList.save();
        return response(res, 200, "Item removed from wishList", wishList);
    } catch (error) {
        console.error(error);
        response(res, 500, "Internal server error");
    }
}

export const getWishListByUser = async (req: Request, res: Response) => {
    try {
        const userId = req?.id;

        let wishList = await Wishlist.findOne({ user: userId }).populate("products");
        if(!wishList){return response(res, 404, "WishList is empty", {Products :[]});}

        await wishList.save();
        return response(res, 200, "Cart retrieved successfully", wishList);
    } catch (error) {
        console.error(error);
        response(res, 500, "Internal server error");
    }
}

