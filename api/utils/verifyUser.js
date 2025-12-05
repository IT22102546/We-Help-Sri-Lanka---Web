import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.acess_token;
  console.log('Token from cookies:', token); // Add this for debugging
  console.log('All cookies:', req.cookies); // Add this for d
  if (!token) return next(errorHandler(401, "You are not Authenticated"));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(errorHandler(403, "Token is not Valid"));
    req.user = user;
    next();
  });
};
