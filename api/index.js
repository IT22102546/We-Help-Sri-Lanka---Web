// index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import staffRoutes from "./routes/staff.routes.js";
import adminRoutes from "./routes/admin.route.js";
import path from "path";
import { fileURLToPath } from "url";
import donationRoute from "./routes/donation.route.js";
import donarRoutes from "./routes/donar.route.js";
// For ES6 module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Validate environment variables
if (!process.env.MONGO) {
  console.error("❌ MONGO environment variable is not set");
  process.exit(1);
}

// MongoDB connection
const MONGODB_URI = process.env.MONGO;
console.log("🔧 Attempting to connect to MongoDB...");
console.log(`Database: ${MONGODB_URI.split("/").pop().split("?")[0]}`);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("💡 Connection string used:", MONGODB_URI);
    process.exit(1);
  });

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

// Serve static files (if needed)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "We Help Sri Lanka Backend is running successfully!",
    database: mongoose.connection.db?.databaseName || "Not connected",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(200).json({
    success: dbStatus === 1,
    message: `Database status: ${statusMap[dbStatus] || "unknown"}`,
    database: mongoose.connection.db?.databaseName,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/donation-requests", donationRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/donar", donarRoutes);


// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("Error:", err);

  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});
