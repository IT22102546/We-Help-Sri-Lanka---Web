// routes/donationRequestRoutes.js
import express from "express";
import {
  createDonationRequest,
  getAllDonationRequests,
  getDonationRequestById,
  updateDonationRequest,
  deleteDonationRequest,
  bulkUpdateDonationRequests,
  getDashboardStatistics,
  exportDonationRequests,
  getFieldSuggestions,
  getTotalStatistics,
  getDonationListings
} from "../controllers/donation.controller.js";

const router = express.Router();

// Public routes
router.post("/", createDonationRequest);
router.get("/", getAllDonationRequests);

// IMPORTANT: Put all static routes BEFORE parameterized routes
router.get("/getdonationlistings", getDonationListings);
router.get("/suggestions/:field", getFieldSuggestions);
router.get("/statistics/total", getTotalStatistics);
router.get("/statistics/dashboard", getDashboardStatistics);
router.get("/export/data", exportDonationRequests);

// Parameterized routes come LAST
router.get("/:id", getDonationRequestById);
router.put("/:id", updateDonationRequest);
router.delete("/:id", deleteDonationRequest);

// Other routes
router.patch("/bulk-update", bulkUpdateDonationRequests);

export default router;