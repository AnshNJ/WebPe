import UnauthenticatedError from "../errors/unauthenticated";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../utils/jwt.util";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    if(req.method === "OPTIONS") {
        return res.status(StatusCodes.OK).json({ message: "OK" });
    }

    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthenticatedError("Invalid or missing token");
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token) as { userId: string };
        req.user = decoded; 
        next();
    } catch (error) {
        throw new UnauthenticatedError("Invalid or expired token");
    }
}

export { authenticateToken };