// controllers/donationRequestController.js
import DonationRequest from "../models/reqDonation.model.js";
import mongoose from "mongoose";

// @desc    Create a new donation request
// @route   POST /api/donation-requests
// @access  Public/Private (depending on your auth)
export const createDonationRequest = async (req, res) => {
  try {
    const {
      name,
      phone,
      district,
      address,
      numberOfPeople,
      requirements,
      otherRequirements,
      time,
      priority,
      verified,
      verificationConfirmation,
      callStatus,
      remarks,
      status,
      actionTaken,
    } = req.body;

    // Parse phone numbers if it's a string
    let phoneArray = [];
    if (phone) {
      if (typeof phone === "string") {
        phoneArray = phone
          .split(/[/,]/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0);
      } else if (Array.isArray(phone)) {
        phoneArray = phone;
      }
    }

    // Parse requirements if it's a string
    let requirementsArray = [];
    if (requirements) {
      if (typeof requirements === "string") {
        requirementsArray = requirements
          .split(",")
          .map((r) => r.trim())
          .filter((r) => r.length > 0);
      } else if (Array.isArray(requirements)) {
        requirementsArray = requirements;
      }
    }

    // Parse other requirements if it's a string
    let otherRequirementsArray = [];
    if (otherRequirements) {
      if (typeof otherRequirements === "string") {
        otherRequirementsArray = otherRequirements
          .split(",")
          .map((or) => or.trim())
          .filter((or) => or.length > 0);
      } else if (Array.isArray(otherRequirements)) {
        otherRequirementsArray = otherRequirements;
      }
    }

    // Create donation request
    const donationRequest = new DonationRequest({
      timestamp: new Date(),
      name: name || "",
      phone: phoneArray,
      district: district || "",
      address: address || "",
      numberOfPeople: numberOfPeople || "",
      requirements: requirementsArray,
      otherRequirements: otherRequirementsArray,
      time: time || "",
      priority: priority || 3,
      verified: verified || false,
      verificationConfirmation: verificationConfirmation || false,
      callStatus: callStatus || "",
      remarks: remarks || "",
      status: status || "Not yet received",
      actionTaken: actionTaken || "",
    });

    const savedRequest = await donationRequest.save();

    res.status(201).json({
      success: true,
      message: "Donation request created successfully",
      data: savedRequest,
    });
  } catch (error) {
    console.error("Error creating donation request:", error);
    res.status(500).json({
      success: false,
      message: "Error creating donation request",
      error: error.message,
    });
  }
};

// @desc    Get all donation requests with filtering
// @route   GET /api/donation-requests
// @access  Public/Private
// @desc    Get all donation requests with filtering
// @route   GET /api/donation-requests
// @access  Public/Private
export const getAllDonationRequests = async (req, res) => {
  try {
    // console.log("Query params:", req.query);

    const {
      district,
      status,
      priority,
      verified,
      callStatus,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};
    // console.log("Initial filter:", filter);

    if (district && district !== "all") {
      filter.district = { $regex: district, $options: "i" };
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (priority) {
      const priorityNum = parseInt(priority);
      if (!isNaN(priorityNum) && priorityNum >= 1 && priorityNum <= 5) {
        filter.priority = priorityNum;
      }
    }

    if (verified !== undefined) {
      filter.verified = verified === "true";
    }

   if (callStatus !== undefined && callStatus !== "all") {
  // Allow empty string as a valid filter
  filter.callStatus = callStatus;
}

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { district: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } }, // Fixed: notes not remarks
        { phone: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // console.log("Final filter:", JSON.stringify(filter, null, 2));

    // Sort configuration
    const sort = {};
    const sortField = sortBy === "timestamp" ? "timestamp" : sortBy;
    sort[sortField] = sortOrder === "desc" ? -1 : 1;

    // console.log("Sort:", sort);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // FIRST: Try a simple count to see if there's any data
    const totalCount = await DonationRequest.countDocuments({});
    // console.log("Total documents in collection:", totalCount);

    const filteredCount = await DonationRequest.countDocuments(filter);
    // console.log("Filtered documents count:", filteredCount);

    // SECOND: Try a simple find without aggregation first
    const simpleTest = await DonationRequest.find({}).limit(3).lean();
    // console.log("Simple test result (first 3 docs):", simpleTest.length);
    if (simpleTest.length > 0) {
      //   console.log("Sample document fields:", Object.keys(simpleTest[0]));
    }

    // Execute query with pagination
    const requests = await DonationRequest.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await DonationRequest.countDocuments(filter);

    // console.log("Requests found:", requests.length);

    // THIRD: Try aggregation separately with error handling
    let statusCounts = [];
    let priorityCounts = [];
    let districtCounts = [];

    try {
      statusCounts = await DonationRequest.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);
      //   console.log("Status aggregation result:", statusCounts);
    } catch (aggError) {
      //   console.error("Error in status aggregation:", aggError.message);
    }

    try {
      priorityCounts = await DonationRequest.aggregate([
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      //   console.log("Priority aggregation result:", priorityCounts);
    } catch (aggError) {
      //   console.error("Error in priority aggregation:", aggError.message);
    }

    try {
      districtCounts = await DonationRequest.aggregate([
        {
          $group: {
            _id: "$district",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);
      //   console.log("District aggregation result:", districtCounts);
    } catch (aggError) {
      //   console.error("Error in district aggregation:", aggError.message);
    }

    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
      summary: {
        statusCounts,
        priorityCounts,
        districtCounts,
      },
      debug: {
        totalInCollection: totalCount,
        filteredCount: total,
        sampleData: simpleTest.slice(0, 2), // Send first 2 docs for debugging
      },
    });
  } catch (error) {
    console.error("Error fetching donation requests:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching donation requests",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Get single donation request by ID
// @route   GET /api/donation-requests/:id
// @access  Public/Private
export const getDonationRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation request ID",
      });
    }

    const donationRequest = await DonationRequest.findById(id).lean();

    if (!donationRequest) {
      return res.status(404).json({
        success: false,
        message: "Donation request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: donationRequest,
    });
  } catch (error) {
    console.error("Error fetching donation request:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching donation request",
      error: error.message,
    });
  }
};

// @desc    Update donation request
// @route   PUT /api/donation-requests/:id
// @access  Private (Admin/Volunteer)
export const updateDonationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation request ID",
      });
    }

    // Parse arrays if they're strings
    if (updateData.phone && typeof updateData.phone === "string") {
      updateData.phone = updateData.phone
        .split(/[/,]/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
    }

    if (
      updateData.requirements &&
      typeof updateData.requirements === "string"
    ) {
      updateData.requirements = updateData.requirements
        .split(",")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);
    }

    if (
      updateData.otherRequirements &&
      typeof updateData.otherRequirements === "string"
    ) {
      updateData.otherRequirements = updateData.otherRequirements
        .split(",")
        .map((or) => or.trim())
        .filter((or) => or.length > 0);
    }

    // Prevent updating certain fields if needed
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const updatedRequest = await DonationRequest.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Donation request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation request updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating donation request:", error);
    res.status(500).json({
      success: false,
      message: "Error updating donation request",
      error: error.message,
    });
  }
};

// @desc    Delete donation request
// @route   DELETE /api/donation-requests/:id
// @access  Private (Admin only)
export const deleteDonationRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation request ID",
      });
    }

    const deletedRequest = await DonationRequest.findByIdAndDelete(id);

    if (!deletedRequest) {
      return res.status(404).json({
        success: false,
        message: "Donation request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation request deleted successfully",
      data: {
        id: deletedRequest._id,
      },
    });
  } catch (error) {
    console.error("Error deleting donation request:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting donation request",
      error: error.message,
    });
  }
};

// @desc    Bulk update donation requests
// @route   PATCH /api/donation-requests/bulk-update
// @access  Private (Admin/Volunteer)
export const bulkUpdateDonationRequests = async (req, res) => {
  try {
    const { ids, updateData } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No donation request IDs provided",
      });
    }

    // Validate all IDs
    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid IDs: ${invalidIds.join(", ")}`,
      });
    }

    // Prevent updating certain fields
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const result = await DonationRequest.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} donation requests updated successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Error in bulk update:", error);
    res.status(500).json({
      success: false,
      message: "Error updating donation requests",
      error: error.message,
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/donation-requests/statistics
// @access  Private (Admin/Dashboard)
export const getDashboardStatistics = async (req, res) => {
  try {
    const { district } = req.query;

    const filter = {};
    if (district) {
      filter.district = district;
    }

    // Get total counts
    const totalRequests = await DonationRequest.countDocuments(filter);

    // Get status distribution
    const statusStats = await DonationRequest.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgPriority: { $avg: "$priority" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get priority distribution
    const priorityStats = await DonationRequest.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get district distribution
    const districtStats = await DonationRequest.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$district",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get call status distribution
    const callStatusStats = await DonationRequest.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$callStatus",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await DonationRequest.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    // Get high priority urgent requests
    const urgentRequests = await DonationRequest.find({
      ...filter,
      priority: 5,
      status: { $in: ["Not yet received", "Linked a supplier"] },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        statusStats,
        priorityStats,
        districtStats,
        callStatusStats,
        recentActivity,
        urgentRequests,
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

// @desc    Export donation requests to CSV/Excel
// @route   GET /api/donation-requests/export
// @access  Private (Admin)
export const exportDonationRequests = async (req, res) => {
  try {
    const { format = "csv", ...filters } = req.query;

    // Apply same filters as getAllDonationRequests
    const filter = {};

    if (filters.district) {
      filter.district = { $regex: filters.district, $options: "i" };
    }

    if (filters.status && filters.status !== "all") {
      filter.status = filters.status;
    }

    if (filters.priority) {
      const priorityNum = parseInt(filters.priority);
      if (!isNaN(priorityNum) && priorityNum >= 1 && priorityNum <= 5) {
        filter.priority = priorityNum;
      }
    }

    // Get all matching requests
    const requests = await DonationRequest.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Format data for export
    const formattedData = requests.map((request) => ({
      Timestamp: request.timestamp,
      Name: request.name,
      "Phone Numbers": request.phone.join(", "),
      District: request.district,
      Address: request.address,
      "Number of People": request.numberOfPeople,
      Requirements: request.requirements.join(", "),
      "Other Requirements": request.otherRequirements.join(", "),
      Time: request.time,
      Priority: request.priority,
      Verified: request.verified ? "Yes" : "No",
      "Call Status": request.callStatus,
      Remarks: request.remarks,
      Status: request.status,
      "Created At": request.createdAt,
      "Updated At": request.updatedAt,
    }));

    if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=donation-requests.json"
      );
      return res.status(200).json(formattedData);
    } else {
      // For CSV export, you might want to use a library like json2csv
      // This is simplified version
      const csvData = formatCSV(formattedData);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=donation-requests.csv"
      );
      return res.status(200).send(csvData);
    }
  } catch (error) {
    console.error("Error exporting donation requests:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting donation requests",
      error: error.message,
    });
  }
};

// Helper function to format CSV
const formatCSV = (data) => {
  if (!data.length) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header] || "";
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(value).replace(/"/g, '""');
          return escaped.includes(",") ? `"${escaped}"` : escaped;
        })
        .join(",")
    ),
  ];

  return csvRows.join("\n");
};

// @desc    Get suggestions for autocomplete
// @route   GET /api/donation-requests/suggestions/:field
// @access  Public/Private
export const getFieldSuggestions = async (req, res) => {
  try {
    const { field } = req.params;
    const { query } = req.query;

    if (!["district", "status", "requirements", "callStatus"].includes(field)) {
      return res.status(400).json({
        success: false,
        message: "Invalid field for suggestions",
      });
    }

    const pipeline = [
      {
        $match: {
          [field]: { $exists: true, $ne: "" },
        },
      },
    ];

    // Add search filter if query provided
    if (query) {
      pipeline[0].$match[field] = {
        ...pipeline[0].$match[field],
        $regex: query,
        $options: "i",
      };
    }

    // For array fields (requirements), we need to unwind
    if (field === "requirements") {
      pipeline.push({ $unwind: "$requirements" });
      pipeline.push({
        $group: {
          _id: "$requirements",
          count: { $sum: 1 },
        },
      });
    } else {
      pipeline.push({
        $group: {
          _id: `$${field}`,
          count: { $sum: 1 },
        },
      });
    }

    pipeline.push({ $sort: { count: -1 } }, { $limit: 20 });

    const suggestions = await DonationRequest.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: suggestions.map((s) => ({
        value: s._id,
        count: s.count,
      })),
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching suggestions",
      error: error.message,
    });
  }
};
