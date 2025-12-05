import express from "express";
import {
  getDonationAnalytics,
  getDistrictAnalytics,
  getStatusAnalytics,
  getPriorityAnalytics,
  getDailyAnalytics,
  getDonationRequests,
  searchDonationRequests,
  updateDonationStatus,
  updateDonationVerification
} from "../controllers/admin.controller.js";

const router = express.Router();

// Donation Analytics Routes
router.get("/donation/analytics", getDonationAnalytics);
router.get("/donation/districts", getDistrictAnalytics);
router.get("/donation/status", getStatusAnalytics);
router.get("/donation/priority", getPriorityAnalytics);
router.get("/donation/daily", getDailyAnalytics);

// Donation Management Routes
router.get("/donation/requests", getDonationRequests);
router.get("/donation/search", searchDonationRequests);
router.put("/donation/:id/status", updateDonationStatus);
router.put("/donation/:id/verify", updateDonationVerification);

export default router;