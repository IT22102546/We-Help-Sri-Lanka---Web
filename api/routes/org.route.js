// routes/donationRequestRoutes.js
import express from "express";
import {
    bulkUpdateOrganizations,
    createOrg,
  deleteOrganization,
  exportOrganizations,
  getAllOrganizations,
  getDashboardStatistics,
  getFieldSuggestions,
  getOrganizationById,
  getTotalStatistics,
  updateOrganization,
} from "../controllers/org.controller.js";

const router = express.Router();

// Public routes
router.post("/", createOrg);
router.get("/", getAllOrganizations);
router.get("/:id", getOrganizationById);
router.get("/suggestions/:field", getFieldSuggestions);

// Add this line to your routes
router.get("/statistics/total", getTotalStatistics);

// Protected routes (add authentication middleware as needed)
router.put("/:id", updateOrganization);
router.delete("/:id", deleteOrganization);
router.patch("/bulk-update", bulkUpdateOrganizations);
router.get("/statistics/dashboard", getDashboardStatistics);
router.get("/export/data", exportOrganizations);

export default router;
