import express from "express";
import { login, register, refreshToken } from "../controllers/auth.controller";
const router = express.Router();


router.route("/login").post(login);
router.route("/register").post(register);
router.route("/refresh-token").post(refreshToken);


export default router;