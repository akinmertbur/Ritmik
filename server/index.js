import express from "express";
import cors from "cors";
import playlistRoutes from "./routes/playlistRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", playlistRoutes);

app.get("/", (req, res) => {
  res.send("🎶 Ritmik Server is running...");
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
});
