import express from "express";
import {
  getStaffMembers,
  searchStaffMembers,
  getStaffDetails,
  createStaffMember,
  updateStaffMember,
  updateStaffPassword,
  deleteStaffMember,
  getStaffCount
} from "../controllers/staff.controller.js";

const router = express.Router();

// Staff management routes
router.get("/staff", getStaffMembers);
router.get("/staff/search", searchStaffMembers);
router.get("/staff/count", getStaffCount);
router.get("/staff/:id", getStaffDetails);
router.post("/staff", createStaffMember);
router.put("/staff/:id", updateStaffMember);
router.put("/staff/:id/password", updateStaffPassword);
router.delete("/staff/:id", deleteStaffMember);

export default router;