import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.JWT_SECRET;
const lifeTime = process.env.JWT_LIFE_TIME as string | number;
const refreshLifeTime = process.env.JWT_REFRESH_LIFETIME as string | number;

if(!secret || !lifeTime || !refreshLifeTime) {
    throw new Error("JWT_SECRET or JWT_LIFE_TIME or JWT_REFRESH_LIFETIME is not set");
}

export const createJwt = (userId: string) => {
    return jwt.sign({ userId }, secret, { expiresIn: lifeTime } as jwt.SignOptions);
}

export const createRefreshToken = (userId: string) => {
    return jwt.sign({ userId }, secret, { expiresIn: refreshLifeTime } as jwt.SignOptions);
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, secret);
}
