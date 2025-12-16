import { StatusCodes } from "http-status-codes";
import prisma from "../utils/prisma.util";
import UnauthenticatedError from "../errors/unauthenticated";
import { Request, Response } from "express";
import NotFoundError from "../errors/not-found";
import ForbiddenError from "../errors/forbidden";
import BadRequestError from "../errors/bad-request";

 const getAllVPAs = async (req: Request, res: Response) => {
    const user = req.user;
    if(!user) {
        throw new UnauthenticatedError("Unauthorized");
    }
    const vpas = await prisma.vpa.findMany({
        where: { userId: Number(user.userId) }
    });
    res.status(StatusCodes.OK).json({ message: "All VPAs fetched successfully", vpas });
}

 const createVPA = async (req: Request, res: Response) => {
    const user = req.user;
    if(!user) {
        throw new UnauthenticatedError("Unauthorized");
    }
    const { vpa } = req.body;
    const newVPA = await prisma.vpa.create({
        data: { vpa, userId: Number(user.userId) }
    });
    res.status(StatusCodes.CREATED).json({ message: "VPA created successfully", vpa: newVPA.vpa });
}

 const setPrimaryVPA = async (req: Request, res: Response) => {
    const user = req.user;
    if(!user) {
        throw new UnauthenticatedError("Unauthorized");
    }
    const { id } = req.params;
    const vpaId = Number(id);
    
    const userId = Number(user.userId);
    
    const vpa = await prisma.vpa.findFirst({
        where: { 
            id: vpaId,
            userId: userId
        }
    });
    
    if(!vpa) {
        throw new NotFoundError("VPA not found");
    }
    
    await prisma.vpa.updateMany({
        where: { userId: userId },
        data: { isPrimary: false }
    });
    
    const updatedVPA = await prisma.vpa.update({
        where: { id: vpaId },
        data: { isPrimary: true }
    });
    
    res.status(StatusCodes.OK).json({ message: "VPA set as primary successfully", vpa: updatedVPA });
}

 const deleteVPA = async (req: Request, res: Response) => {
    const user = req.user;
    if(!user) {
        throw new UnauthenticatedError("Unauthorized");
    }
    const { id } = req.params;
    const vpaId = Number(id);
    
    const userId = Number(user.userId);
    
    const vpa = await prisma.vpa.findFirst({
        where: { 
            id: vpaId,
            userId: userId
        }
    });
    
    if(!vpa) {
        throw new NotFoundError("VPA not found");
    }
    
    await prisma.vpa.delete({
        where: { id: vpaId }
    });
    
    res.status(StatusCodes.OK).json({ message: "VPA deleted successfully" });
}

 const getVPADetails = async (req: Request, res: Response) => {
    const user = req.user;
    if(!user) {
        throw new UnauthenticatedError("Unauthorized");
    }
    const { id } = req.params;
    const vpaId = Number(id);
    
    const userId = Number(user.userId);
    
    const fetchedVPA = await prisma.vpa.findFirst({
        where: { 
            id: vpaId,
            userId: userId
        }
    });
    
    if(!fetchedVPA) {
        throw new NotFoundError("VPA not found");
    }
    
    res.status(StatusCodes.OK).json({ message: "VPA details fetched successfully", vpa: fetchedVPA });
}

 export { getAllVPAs, createVPA, setPrimaryVPA, deleteVPA, getVPADetails };