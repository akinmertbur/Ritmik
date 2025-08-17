import express from "express";
import { imageProxy } from "../controllers/imageProxyController.js";

const router = express.Router();

router.get("/proxy-image", imageProxy);

export default router;
