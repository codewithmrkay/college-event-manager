import express from "express";
import { getUploadSignature } from "../controllers/upload.controller.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

// POST /api/upload/signature
// Protected route — user must be logged in to get upload signature
router.post("/signature", protectRoute, getUploadSignature);

export default router;