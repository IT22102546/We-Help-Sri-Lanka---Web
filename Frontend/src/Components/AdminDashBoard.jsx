import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
import DashSidebar from "./DashSideBar";
import {
  FaUser,
  FaCalendarAlt,
  FaHeart,
  FaMoneyBill,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaChartLine,
  FaChartBar,
  FaChartPie,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import AdminHeader from "./AdminHeader";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Lazy load components
const AdminStaff = lazy(() => import("../Pages/admin/AdminStaff"));
const AdminPackageBookings = lazy(() =>
  import("../Pages/admin/AdminPackageBookings")
);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalDonations: 0,
    verifiedDonations: 0,
    pendingDonations: 0,
    verificationRate: 0,
    districtData: [],
    statusData: [],
    priorityData: [],
    dailyData: [],
    recentRequests: 0,
    loading: true,
    searchKey: "",
    currentPage: 1,
    itemsPerPage: 10,
  });

  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userType, setUserType] = useState(null);

  // Check user type from localStorage
  useEffect(() => {
    const checkUserType = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserType(parsedUser.user_type_id);
        }
      } catch (error) {
        console.error("Error checking user type:", error);
      }
    };

    checkUserType();
  }, []);

  const isStaff = userType === 3;
  const isAdmin = userType === 1;

  // Fetch donation analytics
  useEffect(() => {
    if (activeSection === "dashboard") {
      const fetchAnalytics = async () => {
        try {
          setDashboardData((prev) => ({ ...prev, loading: true }));

          const endpoints = [
            "/api/admin/donation/analytics",
            "/api/admin/donation/districts",
            "/api/admin/donation/status",
            "/api/admin/donation/priority",
            "/api/admin/donation/daily",
          ];

          const responses = await Promise.all(
            endpoints.map((endpoint) =>
              fetch(endpoint).then((res) => res.json())
            )
          );

          const [analytics, districts, status, priority, daily] = responses;

          if (
            analytics.success &&
            districts.success &&
            status.success &&
            priority.success &&
            daily.success
          ) {
            setDashboardData((prev) => ({
              ...prev,
              totalDonations: analytics.data.totalRequests,
              verifiedDonations: analytics.data.verifiedRequests,
              pendingDonations: analytics.data.pendingRequests,
              verificationRate: analytics.data.verificationRate,
              recentRequests: analytics.data.recentRequests,
              districtData: districts.data.districtAnalytics || [],
              statusData: status.data || [],
              priorityData: priority.data || [],
              dailyData: daily.data || [],
              loading: false,
            }));
          } else {
            throw new Error("Failed to fetch analytics data");
          }
        } catch (error) {
          console.error("Failed to fetch analytics:", error);
          setDashboardData((prev) => ({ ...prev, loading: false }));
        }
      };
      fetchAnalytics();
    }
  }, [activeSection]);

  // Navigation
  const handleNavItemClick = (section) => {
    setActiveSection(section);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      width: "16rem",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    closed: {
      x: "-100%",
      width: "16rem",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const contentVariants = {
    open: { marginLeft: "16rem" },
    closed: { marginLeft: "0" },
  };

  // Skeleton loading component
  const renderSkeleton = () => (
    <div className="p-4 md:p-6 pt-20 md:pt-24">
      <div className="mb-6">
        <Skeleton
          height={32}
          width={200}
          baseColor="#dbeafe"
          highlightColor="#e0f2fe"
        />
        <Skeleton
          height={20}
          width={150}
          baseColor="#dbeafe"
          highlightColor="#e0f2fe"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-white rounded-xl shadow p-4">
            <Skeleton
              height={80}
              baseColor="#dbeafe"
              highlightColor="#e0f2fe"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <Skeleton height={300} baseColor="#dbeafe" highlightColor="#e0f2fe" />
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <Skeleton height={300} baseColor="#dbeafe" highlightColor="#e0f2fe" />
        </div>
      </div>
    </div>
  );

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1:
        return "bg-red-100 text-red-800";
      case 2:
        return "bg-orange-100 text-orange-800";
      case 3:
        return "bg-yellow-100 text-yellow-800";
      case 4:
        return "bg-blue-100 text-blue-800";
      case 5:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Received":
        return "bg-green-100 text-green-800";
      case "Already received":
        return "bg-teal-100 text-teal-800";
      case "Linked a supplier":
        return "bg-blue-100 text-blue-800";
      case "FAKE":
        return "bg-red-100 text-red-800";
      case "Not yet received":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderDashboardContent = () => (
    <div className="p-4 md:p-6 pt-20 md:pt-24">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Donation Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Real-time analysis of donation requests across Sri Lanka
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Donations Card */}
        <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {dashboardData.totalDonations}
              </h2>
              <p className="text-gray-600">Total Requests</p>
              <p className="text-sm text-gray-500 mt-1">
                All donation requests
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <FaChartBar className="text-2xl text-white" />
            </div>
          </div>
        </div>

        {/* Verified Donations Card */}
        <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {dashboardData.verifiedDonations}
              </h2>
              <p className="text-gray-600">Verified</p>
              <p className="text-sm text-gray-500 mt-1">Verified requests</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
              <FaCheckCircle className="text-2xl text-white" />
            </div>
          </div>
        </div>

        {/* Pending Donations Card */}
        <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {dashboardData.pendingDonations}
              </h2>
              <p className="text-gray-600">Pending</p>
              <p className="text-sm text-gray-500 mt-1">Needs verification</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
              <FaClock className="text-2xl text-white" />
            </div>
          </div>
        </div>

        {/* Verification Rate Card */}
        <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {dashboardData.verificationRate}%
              </h2>
              <p className="text-gray-600">Verification Rate</p>
              <p className="text-sm text-gray-500 mt-1">Verified vs total</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <FaChartLine className="text-2xl text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* District-wise Distribution */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-500" />
              District-wise Distribution
            </h3>
            <span className="text-sm text-gray-500">Top 10 Districts</span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {dashboardData.districtData.slice(0, 10).map((district, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">
                    {district.district || "Unknown"}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {district.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (district.total /
                          Math.max(
                            ...dashboardData.districtData.map((d) => d.total)
                          )) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>✓ {district.verified} verified</span>
                  <span>⏳ {district.pending} pending</span>
                  <span>
                    {district.verificationRate?.toFixed(1) || 0}% rate
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status-wise Distribution */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaChartPie className="mr-2 text-green-500" />
              Request Status
            </h3>
            <span className="text-sm text-gray-500">All status types</span>
          </div>
          <div className="space-y-3">
            {dashboardData.statusData.map((statusItem, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      statusItem.status
                    )}`}
                  >
                    {statusItem.status || "Not specified"}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">
                      {statusItem.total}
                    </div>
                    <div className="text-xs text-gray-500">
                      ✓ {statusItem.verified} • ⏳ {statusItem.pending}
                    </div>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                      style={{
                        width: `${
                          (statusItem.verified / statusItem.total) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority and Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Priority-wise Distribution */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaExclamationTriangle className="mr-2 text-red-500" />
              Priority Levels
            </h3>
            <span className="text-sm text-gray-500">
              1 = Highest, 5 = Lowest
            </span>
          </div>
          <div className="space-y-4">
            {dashboardData.priorityData.map((priorityItem, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(
                        priorityItem.priority
                      )}`}
                    >
                      Priority {priorityItem.priority}
                    </span>
                    <span className="text-sm text-gray-600">Urgency level</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">
                      {priorityItem.total}
                    </div>
                    <div className="text-xs text-gray-500">total requests</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-semibold text-green-700">
                      {priorityItem.completed}
                    </div>
                    <div className="text-green-600">Completed</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-semibold text-blue-700">
                      {priorityItem.verified}
                    </div>
                    <div className="text-blue-600">Verified</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="font-semibold text-yellow-700">
                      {priorityItem.pending}
                    </div>
                    <div className="text-yellow-600">Pending</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaCalendarAlt className="mr-2 text-purple-500" />
              Recent Activity
            </h3>
            <span className="text-sm text-gray-500">Last 30 days</span>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Last 7 Days</span>
                <span className="text-lg font-bold text-blue-600">
                  {dashboardData.recentRequests} requests
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                New donation requests received
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {dashboardData.dailyData
                      .slice(-7)
                      .reduce((sum, day) => sum + day.requests, 0)}
                  </div>
                  <div className="text-xs text-gray-600">Last week total</div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {dashboardData.dailyData
                      .slice(-30)
                      .reduce((sum, day) => sum + day.requests, 0)}
                  </div>
                  <div className="text-xs text-gray-600">Last month total</div>
                </div>
              </div>
            </div>

            {/* Daily trend chart */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Daily Trend (Last 7 Days)
              </h4>
              <div className="flex items-end space-x-1 h-24">
                {dashboardData.dailyData.slice(-7).map((day, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t"
                      style={{
                        height: `${
                          (day.requests /
                            Math.max(
                              ...dashboardData.dailyData
                                .slice(-7)
                                .map((d) => d.requests)
                            )) *
                          80
                        }px`,
                      }}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(day.date).getDate()}/
                      {new Date(day.date).getMonth() + 1}
                    </div>
                    <div className="text-xs font-semibold text-gray-800">
                      {day.requests}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-blue-500 mr-2" />
              <span className="font-medium">Highest Demand District</span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold text-gray-800">
                {dashboardData.districtData[0]?.district || "N/A"}
              </div>
              <div className="text-sm text-gray-600">
                {dashboardData.districtData[0]?.total || 0} requests
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              <span className="font-medium">Best Verification Rate</span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold text-gray-800">
                {dashboardData.districtData.sort(
                  (a, b) => b.verificationRate - a.verificationRate
                )[0]?.district || "N/A"}
              </div>
              <div className="text-sm text-gray-600">
                {dashboardData.districtData
                  .sort((a, b) => b.verificationRate - a.verificationRate)[0]
                  ?.verificationRate?.toFixed(1) || 0}
                % rate
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-2" />
              <span className="font-medium">High Priority Requests</span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold text-gray-800">
                {dashboardData.priorityData.find((p) => p.priority === 1)
                  ?.total || 0}
              </div>
              <div className="text-sm text-gray-600">
                Priority 1 urgent requests
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (dashboardData.loading && activeSection === "dashboard") {
      return renderSkeleton();
    }

    return (
      <Suspense fallback={renderSkeleton()}>
        {activeSection === "staff" && <AdminStaff />}
        {activeSection === "bookings" && <AdminPackageBookings />}
        {activeSection === "dashboard" && renderDashboardContent()}
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Animated Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className="fixed h-full z-40"
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
          >
            <DashSidebar
              onNavItemClick={handleNavItemClick}
              activeSection={activeSection}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <motion.div
        className="flex-1"
        animate={isSidebarOpen ? "open" : "closed"}
        variants={contentVariants}
      >
        <AdminHeader onToggleSidebar={toggleSidebar} />
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
