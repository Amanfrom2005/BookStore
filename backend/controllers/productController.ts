import { Request, Response } from "express"

export const createProduct = async (req: Request, res: Response) => {
    try {
        const {title, images, subject, category, condition, classType, price, finalPrice, author, edition, description, shippingCharge, paymentMode, paymentDetails} = req.body;
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}