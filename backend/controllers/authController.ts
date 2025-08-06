import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { response } from "../utils/responseHandler";
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Use env for production

// Register a new user
export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, agreeTerms } = req.body;

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return response(res, 400, 'User already exists', null);
        }

        const verificationToken = crypto.randomBytes(20).toString('hex')
        const user = new User ({ name, email, password, agreeTerms, verificationToken })
        await user.save();

        return response(res, 200, 'User registration successful, please check your email box to verify account', null)

    } catch (error) {
        console.log(error)
        return response(res, 500, 'internel server error, Please try again later', null)
    }
};
