// routes/auth.route.js
import express from "express";
import { adminSignIn } from "../controllers/auth.controller.js";

const router = express.Router();

// Only admin login endpoint
router.post("/admin-login", adminSignIn);

export default router;