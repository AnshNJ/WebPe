import express from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { getProfile, getBalance, updateProfile } from "../controllers/user.controller";
const router = express.Router();

router.route("/profile").get(authenticateToken, getProfile);
router.route("/balance").get(authenticateToken, getBalance);
router.route("/profile").put(authenticateToken, updateProfile);

export default router;