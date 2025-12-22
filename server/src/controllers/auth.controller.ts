import bcrypt from "bcryptjs";
import BadRequestError from "../errors/bad-request";
import { StatusCodes } from "http-status-codes";
import { createJwt, createRefreshToken, verifyToken } from "../utils/jwt.util";
import { Request, Response } from "express";
import prisma from "../utils/prisma.util";

const login = async (req: Request, res: Response) => {
    const {userEmail, password} = req.body;
    if(!userEmail || !password) {
        throw new BadRequestError("Please provide email and password");
    }

    const user = await prisma.user.findUnique({
        where: {
            email: userEmail
        }
    });
    
    // Use same error message to prevent information disclosure
    const isPasswordCorrect = user ? await bcrypt.compare(password, user.passwordHash) : false;
    
    if(!user || !isPasswordCorrect) {
        throw new BadRequestError("Invalid email or password");
    }

    const accessToken  = createJwt(user.id.toString());
    const refreshToken = createRefreshToken(user.id.toString());
    res.status(StatusCodes.OK).json({ accessToken, refreshToken });
}

const register = async (req: Request, res: Response) => {
    const { username, password, email, vpa} = req.body;
    
    // Validate required fields
    if(!username || !password || !email) {
        throw new BadRequestError("Please provide username, email, and password");
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) {
        throw new BadRequestError("Please provide a valid email address");
    }
    
    // Validate password strength (minimum 6 characters)
    if(password.length < 6) {
        throw new BadRequestError("Password must be at least 6 characters long");
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });
    
    if(existingUser) {
        throw new BadRequestError("Email already registered");
    }
    
    const passwordHash = await bcrypt.hash(password, 10);

    // Get or create USER role
    const userRole = await prisma.role.upsert({
        where: { name: 'USER' },
        update: {},
        create: { name: 'USER' },
    });

    const user = await prisma.user.create({
        data: {
            username,
            email,
            passwordHash,
            vpa,
            role: {connect: {id: userRole.id}},
            wallet: {
                create: {
                    balance: 0,
                    currency: "INR"
                }
            }
        }
    });

    const accessToken  = createJwt(user.id.toString());
    const refreshToken = createRefreshToken(user.id.toString());
    res.status(StatusCodes.CREATED).json({ accessToken, refreshToken });
};

const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if(!refreshToken) {
        throw new BadRequestError("Please provide refresh token");
    }

    try {
        const decoded = verifyToken(refreshToken) as { userId: string };
        if(!decoded || !decoded.userId) {
            throw new BadRequestError("Invalid refresh token");
        }

        const accessToken  = createJwt(decoded.userId.toString());
        res.status(StatusCodes.OK).json({ accessToken });
    } catch (error) {
        throw new BadRequestError("Invalid or expired refresh token");
    }
}

export { login, register, refreshToken };