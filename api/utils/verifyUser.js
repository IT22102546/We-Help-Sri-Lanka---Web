// middleware/verifyToken.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  console.log("\n=== TOKEN VERIFICATION ===");

  // Try different sources for token
  let token = null;

  // 1. Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
    console.log("Token found in Authorization header");
  }
  // 2. Check cookies
  else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
    console.log("Token found in cookies");
  }
  // 3. Check x-access-token header
  else if (req.headers["x-access-token"]) {
    token = req.headers["x-access-token"];
    console.log("Token found in x-access-token header");
  }

  console.log("Token present:", !!token);
  if (token) {
    console.log("Token first 50 chars:", token.substring(0, 50) + "...");
  }

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    console.log(
      "Verifying with secret:",
      process.env.JWT_SECRET ? "Secret is set" : "Using default"
    );

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-this"
    );
    console.log("Token decoded successfully:", {
      id: decoded.id,
      email: decoded.email,
      status: decoded.status,
      exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : "No exp",
      iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : "No iat",
    });

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.log("Token expired");
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Token verification failed.",
    });
  }
};
