import { NextFunction, Request, Response } from "express";
import { response } from "../utils/responseHandler";
import jwt from "jsonwebtoken";

declare global {namespace Express {interface Request {id: string;}}}

const authenticatedUser = async(req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.access_token;
    if(!token){return response(res, 401, 'user not authenticated or no token avilable')}
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
        if(!decode){return response(res, 401, 'Not autherized, user not found');}
        req.id = decode.userId;
        next();
    } catch (error) {return response(res, 401, 'Not autherized, token not valid or expired')}
}

export {authenticatedUser};