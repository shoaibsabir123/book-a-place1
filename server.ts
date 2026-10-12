import express from "express";
import path from "path";
import dotenv from "dotenv";
import apiRoutes from "./server/routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API routes
app.use("/api", apiRoutes);

// In production, serve the built static assets from dist
const distPath = path.resolve(__dirname, "dist");
app.use(express.static(distPath));

// Catch-all to support SPA client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`[Book a Place] Server listening on port ${PORT}`);
});
