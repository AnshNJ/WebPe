import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const register = async (req: any, res: any) => {
    const { username, password, email, vpa} = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username,
            email,
            passwordHash,
            vpa,
            role: {connect: {id: 1}},
            wallet: {
                create: {
                    balance: 0,
                    currency: "INR"
                }
            }
        }
    });

    res.json(user);
};

