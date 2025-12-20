import express from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { getAllVPAs, createVPA, setPrimaryVPA, deleteVPA, getVPADetails } from "../controllers/vpa.controller";

const router = express.Router();

router.route("/").get(authenticateToken, getAllVPAs);
router.route("/").post(authenticateToken, createVPA);
router.route("/:id/set-primary").put(authenticateToken, setPrimaryVPA);
router.route("/:id").delete(authenticateToken, deleteVPA);
router.route("/:id").get(authenticateToken, getVPADetails);

export default router;