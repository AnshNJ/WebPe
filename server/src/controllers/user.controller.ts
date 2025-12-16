import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import UnauthenticatedError from "../errors/unauthenticated";
import BadRequestError from "../errors/bad-request";
import prisma from "../utils/prisma.util";

const getProfile = async (req: Request, res: Response) => {
    const user = req.user;
    if(!user) {
        throw new UnauthenticatedError("Unauthorized");
    }
    res.status(StatusCodes.OK).json({ user });
}

const getBalance = async (req: Request, res: Response) => {
    const user = req.user;
    if(!user) {
        throw new UnauthenticatedError("Unauthorized");
    }
    const wallet = await prisma.wallet.findUnique({
        where: {
            userId: Number(user.userId)
        }
    });

    if(!wallet) {
        throw new BadRequestError("Wallet not found");
    }
    res.status(StatusCodes.OK).json({ balance: wallet.balance });
}

const updateProfile = async (req: Request, res: Response) => {
    const user = req.user;
    if(!user) {
        throw new UnauthenticatedError("Unauthorized");
    }
    const { username, email, vpa } = req.body;
    const updatedUser = await prisma.user.update({
        where: { id: Number(user.userId) },
        data: { username, email, vpa }
    });
    res.status(StatusCodes.OK).json({ updatedUser });
}

export { getProfile, getBalance, updateProfile };