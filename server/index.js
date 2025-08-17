import express from "express";
import cors from "cors";
import playlistRoutes from "./routes/playlistRoutes.js";
import imageProxyRoutes from "./routes/imageProxyRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

// Routes
app.use("/api", playlistRoutes);
app.use("/api", imageProxyRoutes);

app.get("/", (req, res) => {
  res.send("🎶 Ritmik Server is running...");
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
});
