import express from "express";
import { suggestPlaylist } from "../controllers/playlistController.js";

const router = express.Router();

router.post("/playlist", suggestPlaylist);

export default router;
