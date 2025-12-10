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
import OrganizationsAdmin from "../Pages/admin/OrganizationsAdmin";
import TransportProviders from "../Pages/admin/TransportProviders";


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
// Get priority color - Updated: 5 is highest, 1 is lowest
const getPriorityColor = (priority) => {
  switch (priority) {
    case 5: // Highest priority
      return "bg-red-100 text-red-800";
    case 4:
      return "bg-orange-100 text-orange-800";
    case 3:
      return "bg-yellow-100 text-yellow-800";
    case 2:
      return "bg-blue-100 text-blue-800";
    case 1: // Lowest priority
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Get priority label
const getPriorityLabel = (priority) => {
  switch (priority) {
    case 5:
      return "Highest Priority (5)";
    case 4:
      return "High Priority (4)";
    case 3:
      return "Medium Priority (3)";
    case 2:
      return "Low Priority (2)";
    case 1:
      return "Lowest Priority (1)";
    default:
      return `Priority ${priority}`;
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
      5 = Highest, 1 = Lowest
    </span>
  </div>
  <div className="space-y-4">
    {[...dashboardData.priorityData]
      .sort((a, b) => b.priority - a.priority) // Sort by priority descending (5 to 1)
      .map((priorityItem, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(
                  priorityItem.priority
                )}`}
              >
                {getPriorityLabel(priorityItem.priority)}
              </span>
              <span className="text-sm text-gray-600">
                {priorityItem.priority === 5 && "Urgent - Immediate attention"}
                {priorityItem.priority === 4 && "High - Quick response"}
                {priorityItem.priority === 3 && "Medium - Standard response"}
                {priorityItem.priority === 2 && "Low - When possible"}
                {priorityItem.priority === 1 && "Lowest - Non-urgent"}
              </span>
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

        {/* Recent Activity - Redesigned */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaCalendarAlt className="mr-2 text-purple-500" />
                Recent Activity Timeline
              </h3>
              <p className="text-sm text-gray-500">Last 30 days overview</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                Real-time
              </span>
            </div>
          </div>

          {/* Activity Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                  <FaCalendarAlt className="text-white text-lg" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Last 7 Days</div>
                  <div className="text-2xl font-bold text-gray-800">{dashboardData.recentRequests}</div>
                  <div className="text-xs text-gray-500">New requests</div>
                </div>
              </div>
              {dashboardData.dailyData.slice(-7).length > 0 && (
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  ↑ {Math.round((dashboardData.dailyData.slice(-7).reduce((sum, day) => sum + day.requests, 0) / 
                    (dashboardData.dailyData.slice(-14, -7).reduce((sum, day) => sum + day.requests, 0) || 1)) * 100 - 100)}% from previous week
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center mr-3">
                  <FaCheckCircle className="text-white text-lg" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Weekly Verified</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {dashboardData.dailyData.slice(-7).reduce((sum, day) => sum + day.verified, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Verified this week</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-green-600 font-medium">
                {dashboardData.dailyData.slice(-7).reduce((sum, day) => sum + day.requests, 0) > 0 
                  ? `${Math.round((dashboardData.dailyData.slice(-7).reduce((sum, day) => sum + day.verified, 0) / 
                      dashboardData.dailyData.slice(-7).reduce((sum, day) => sum + day.requests, 0) * 100))}% verification rate`
                  : 'No data'}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center mr-3">
                  <FaChartLine className="text-white text-lg" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Active Period</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {dashboardData.dailyData
                      .slice(-30)
                      .reduce((sum, day) => sum + day.requests, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Last 30 days</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-purple-600 font-medium">
                Avg. {Math.round(dashboardData.dailyData.slice(-30).reduce((sum, day) => sum + day.requests, 0) / 30)} requests/day
              </div>
            </div>
          </div>

          {/* Daily Activity Chart with Enhanced Design */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-700">Daily Request Trend</h4>
              <div className="flex space-x-2">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">Last 7 Days</span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">Detailed</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-end space-x-2 h-32">
                {dashboardData.dailyData.slice(-7).map((day, index) => {
                  const maxRequests = Math.max(...dashboardData.dailyData.slice(-7).map(d => d.requests));
                  const barHeight = maxRequests > 0 ? (day.requests / maxRequests) * 100 : 0;
                  const verifiedPercentage = day.requests > 0 ? (day.verified / day.requests) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="relative w-8">
                        {/* Background bar (total requests) */}
                        <div 
                          className="w-8 bg-gradient-to-t from-blue-400 to-blue-300 rounded-t"
                          style={{ height: `${barHeight}px` }}
                        />
                        {/* Verified portion overlay */}
                        <div 
                          className="w-8 absolute bottom-0 bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                          style={{ height: `${barHeight * (verifiedPercentage / 100)}px` }}
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <div className="text-xs font-semibold text-gray-800">{day.requests}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Chart Legend */}
              <div className="flex justify-center space-x-4 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded mr-2"></div>
                  <span className="text-xs text-gray-600">Total Requests</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-400 rounded mr-2"></div>
                  <span className="text-xs text-gray-600">Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Recent Activity Breakdown</h4>
            <div className="space-y-3">
              {/* Highest Activity Day */}
              {dashboardData.dailyData.length > 0 && (() => {
                const highestDay = dashboardData.dailyData.reduce((prev, current) => 
                  prev.requests > current.requests ? prev : current
                );
                return (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center mr-3">
                        <FaChartBar className="text-white text-sm" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">Peak Activity Day</div>
                        <div className="text-sm text-gray-600">
                          {new Date(highestDay.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-600">{highestDay.requests}</div>
                      <div className="text-xs text-gray-500">requests</div>
                    </div>
                  </div>
                );
              })()}

              {/* Verification Rate Trend */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <FaCheckCircle className="text-white text-sm" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Verification Trend</div>
                    <div className="text-sm text-gray-600">Last 7 days average</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {dashboardData.dailyData.slice(-7).reduce((sum, day) => sum + (day.requests > 0 ? (day.verified / day.requests) * 100 : 0), 0) / 7 > 0
                      ? `${Math.round(dashboardData.dailyData.slice(-7).reduce((sum, day) => sum + (day.requests > 0 ? (day.verified / day.requests) * 100 : 0), 0) / 7)}%`
                      : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">verification rate</div>
                </div>
              </div>

              {/* Activity Trend Indicator */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                    <FaChartLine className="text-white text-sm" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Activity Trend</div>
                    <div className="text-sm text-gray-600">Week-over-week change</div>
                  </div>
                </div>
                <div className="text-right">
                  {dashboardData.dailyData.slice(-7).length > 0 && dashboardData.dailyData.slice(-14, -7).length > 0 && (() => {
                    const currentWeek = dashboardData.dailyData.slice(-7).reduce((sum, day) => sum + day.requests, 0);
                    const prevWeek = dashboardData.dailyData.slice(-14, -7).reduce((sum, day) => sum + day.requests, 0);
                    const change = prevWeek > 0 ? ((currentWeek - prevWeek) / prevWeek) * 100 : 0;
                    
                    return (
                      <>
                        <div className={`text-lg font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {change >= 0 ? '↑' : '↓'} {Math.abs(Math.round(change))}%
                        </div>
                        <div className="text-xs text-gray-500">{change >= 0 ? 'Increase' : 'Decrease'}</div>
                      </>
                    );
                  })()}
                </div>
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
      {dashboardData.priorityData.find((p) => p.priority === 5)
        ?.total || 0}
    </div>
    <div className="text-sm text-gray-600">
      Highest priority (5) urgent requests
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
        {activeSection === "organizationAdmin" && <OrganizationsAdmin />}
        {activeSection === "TransportProviders" && <TransportProviders />}
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
