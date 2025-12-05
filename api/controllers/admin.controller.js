import DonationRequest from "../models/reqDonation.model.js";

// Get comprehensive donation analytics
export const getDonationAnalytics = async (req, res) => {
  try {
    // Get total counts
    const totalRequests = await DonationRequest.countDocuments();
    const verifiedRequests = await DonationRequest.countDocuments({ verified: true });
    const pendingRequests = await DonationRequest.countDocuments({ verified: false });
    
    // Get status distribution
    const statusCounts = await DonationRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get priority distribution
    const priorityCounts = await DonationRequest.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get recent requests (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRequests = await DonationRequest.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        verifiedRequests,
        pendingRequests,
        verificationRate: totalRequests > 0 ? (verifiedRequests / totalRequests * 100).toFixed(1) : 0,
        statusCounts: statusCounts.reduce((acc, curr) => {
          acc[curr._id || 'Not specified'] = curr.count;
          return acc;
        }, {}),
        priorityCounts: priorityCounts.reduce((acc, curr) => {
          acc[`Priority ${curr._id}`] = curr.count;
          return acc;
        }, {}),
        recentRequests
      }
    });
  } catch (error) {
    console.error("Donation analytics error:", error);
    res.status(500).json({ 
      error: "Failed to fetch donation analytics",
      details: error.message 
    });
  }
};

// Get district-wise analytics
export const getDistrictAnalytics = async (req, res) => {
  try {
    const districtAnalytics = await DonationRequest.aggregate([
      {
        $group: {
          _id: "$district",
          total: { $sum: 1 },
          verified: {
            $sum: { $cond: [{ $eq: ["$verified", true] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$verified", false] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          district: "$_id",
          total: 1,
          verified: 1,
          pending: 1,
          verificationRate: {
            $multiply: [
              { $divide: ["$verified", "$total"] },
              100
            ]
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Calculate totals
    const totals = districtAnalytics.reduce((acc, curr) => {
      acc.total += curr.total;
      acc.verified += curr.verified;
      acc.pending += curr.pending;
      return acc;
    }, { total: 0, verified: 0, pending: 0 });

    totals.verificationRate = totals.total > 0 
      ? ((totals.verified / totals.total) * 100).toFixed(1) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        districtAnalytics,
        totals
      }
    });
  } catch (error) {
    console.error("District analytics error:", error);
    res.status(500).json({ 
      error: "Failed to fetch district analytics",
      details: error.message 
    });
  }
};

// Get status-wise analytics
export const getStatusAnalytics = async (req, res) => {
  try {
    const statusAnalytics = await DonationRequest.aggregate([
      {
        $group: {
          _id: "$status",
          total: { $sum: 1 },
          verified: {
            $sum: { $cond: [{ $eq: ["$verified", true] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          status: "$_id",
          total: 1,
          verified: 1,
          pending: { $subtract: ["$total", "$verified"] }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: statusAnalytics
    });
  } catch (error) {
    console.error("Status analytics error:", error);
    res.status(500).json({ 
      error: "Failed to fetch status analytics",
      details: error.message 
    });
  }
};

// Get priority-wise analytics
export const getPriorityAnalytics = async (req, res) => {
  try {
    const priorityAnalytics = await DonationRequest.aggregate([
      {
        $group: {
          _id: "$priority",
          total: { $sum: 1 },
          verified: {
            $sum: { $cond: [{ $eq: ["$verified", true] }, 1, 0] }
          },
          completed: {
            $sum: { 
              $cond: [{ 
                $in: ["$status", ["Received", "Already received"]] 
              }, 1, 0] 
            }
          }
        }
      },
      {
        $project: {
          priority: "$_id",
          total: 1,
          verified: 1,
          completed: 1,
          pending: { $subtract: ["$total", "$verified"] },
          verificationRate: {
            $multiply: [
              { $divide: ["$verified", "$total"] },
              100
            ]
          },
          completionRate: {
            $multiply: [
              { $divide: ["$completed", "$total"] },
              100
            ]
          }
        }
      },
      { $sort: { priority: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: priorityAnalytics
    });
  } catch (error) {
    console.error("Priority analytics error:", error);
    res.status(500).json({ 
      error: "Failed to fetch priority analytics",
      details: error.message 
    });
  }
};

// Get daily analytics for the last 30 days
export const getDailyAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyAnalytics = await DonationRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          requests: { $sum: 1 },
          verified: {
            $sum: { $cond: [{ $eq: ["$verified", true] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          date: "$_id",
          requests: 1,
          verified: 1,
          pending: { $subtract: ["$requests", "$verified"] }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: dailyAnalytics
    });
  } catch (error) {
    console.error("Daily analytics error:", error);
    res.status(500).json({ 
      error: "Failed to fetch daily analytics",
      details: error.message 
    });
  }
};

// Get all donation requests with pagination
export const getDonationRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const requests = await DonationRequest.find()
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DonationRequest.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error("Get donation requests error:", error);
    res.status(500).json({ 
      error: "Failed to fetch donation requests",
      details: error.message 
    });
  }
};

// Search donation requests
export const searchDonationRequests = async (req, res) => {
  try {
    const { query, district, status, verified, priority } = req.query;
    
    const searchFilter = {};
    
    if (query) {
      searchFilter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (district) searchFilter.district = district;
    if (status) searchFilter.status = status;
    if (verified !== undefined) searchFilter.verified = verified === 'true';
    if (priority) searchFilter.priority = parseInt(priority);

    const requests = await DonationRequest.find(searchFilter)
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error("Search donation requests error:", error);
    res.status(500).json({ 
      error: "Failed to search donation requests",
      details: error.message 
    });
  }
};

// Update donation request status
export const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Not yet received', 'Linked a supplier', 'Received', 'Already received', 'FAKE', ''];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid status value" 
      });
    }

    const updatedRequest = await DonationRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ 
        success: false,
        error: "Donation request not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: updatedRequest
    });
  } catch (error) {
    console.error("Update donation status error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to update donation status",
      details: error.message 
    });
  }
};

// Update donation request verification status
export const updateDonationVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    if (typeof verified !== 'boolean') {
      return res.status(400).json({ 
        success: false,
        error: "Verified must be a boolean value" 
      });
    }

    const updatedRequest = await DonationRequest.findByIdAndUpdate(
      id,
      { verified },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ 
        success: false,
        error: "Donation request not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: updatedRequest
    });
  } catch (error) {
    console.error("Update donation verification error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to update verification status",
      details: error.message 
    });
  }
};