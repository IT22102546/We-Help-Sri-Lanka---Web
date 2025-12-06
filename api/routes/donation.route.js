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
  getDonationListings,
  ggetDonationListingsById,
} from "../controllers/donation.controller.js";

const router = express.Router();

// Public routes
router.get("/getdonationlistings", getDonationListings);
router.get('/getdonationlistings/:id', ggetDonationListingsById);
router.post("/", createDonationRequest);
router.get("/", getAllDonationRequests);
router.get("/:id", getDonationRequestById);
router.get("/suggestions/:field", getFieldSuggestions);


// Protected routes (add authentication middleware as needed)
router.put("/:id", updateDonationRequest);
router.delete("/:id", deleteDonationRequest);
router.patch("/bulk-update", bulkUpdateDonationRequests);
router.get("/statistics/dashboard", getDashboardStatistics);
router.get("/export/data", exportDonationRequests);

export default router;
