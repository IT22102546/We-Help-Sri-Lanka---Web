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
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import AdminHeader from "./AdminHeader";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Lazy load components
const AdminProfiles = lazy(() => import("../Pages/admin/AdminProfiles"));
const AdminPackageBookings = lazy(() => import("../Pages/admin/AdminPackageBookings"));
const AdminInterested = lazy(() => import("../Pages/admin/AdminInterested"));
const AdminProfileInterested = lazy(() => import("../Pages/admin/AdminProfileInterested"));
const AdminStaff = lazy(() => import("../Pages/admin/AdminStaff"));

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    profileCount: 0,
    bookingsCount: 0,
    intrestCount: 0,
    totalEarnings: 0,
    customers: [],
    allCustomers: [],
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
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserType(parsedUser.user_type_id);
        } else if (localStorage.getItem('isStaff') === 'true') {
          setUserType(3); // Staff user_type_id
        } else if (localStorage.getItem('isAdmin') === 'true') {
          setUserType(1); // Admin user_type_id
        } else {
          const userTypeId = localStorage.getItem('userTypeId');
          if (userTypeId) {
            setUserType(parseInt(userTypeId));
          }
        }
      } catch (error) {
        console.error("Error checking user type:", error);
      }
    };

    checkUserType();
  }, []);

  const isStaff = userType === 3;
  const isAdmin = userType === 1;

  // Format currency function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    })
      .format(amount)
      .replace("$", "Rs.");
  };

  // Memoize formatted earnings
  const formattedEarnings = useMemo(
    () => formatCurrency(dashboardData.totalEarnings),
    [dashboardData.totalEarnings]
  );

  // Fetch data only when needed
  useEffect(() => {
    if (activeSection === "dashboard") {
      const fetchData = async () => {
        try {
          setDashboardData((prev) => ({ ...prev, loading: true }));
          
          // For staff users, don't fetch earnings data
          const fetchPromises = [
            fetch("/api/admin/profiles"),
            fetch("/api/admin/bookings/count"),
            fetch("/api/admin/interests/count"),
          ];

          // Only admin users fetch earnings data
          if (isAdmin) {
            fetchPromises.push(fetch("/api/admin/earnings"));
          }

          const responses = await Promise.all(fetchPromises);
          const [profileRes, bookingsRes, intrestRes, earningsRes] = responses;

          const [profileData, bookingsData, intrestData] = await Promise.all([
            profileRes.json(),
            bookingsRes.json(),
            intrestRes.json(),
          ]);

          let earningsData = { amount: 0 };
          if (isAdmin && earningsRes) {
            earningsData = await earningsRes.json();
          }

          setDashboardData((prev) => ({
            ...prev,
            profileCount: profileData.length || 0,
            bookingsCount: bookingsData.count || 0,
            intrestCount: intrestData.count || 0,
            totalEarnings: earningsData.amount || 0,
            customers: profileData,
            allCustomers: profileData,
            loading: false,
          }));
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
          setDashboardData((prev) => ({ ...prev, loading: false }));
        }
      };
      fetchData();
    }
  }, [activeSection, isAdmin]);

  // Search optimization with debounce
  useEffect(() => {
    if (dashboardData.searchKey.trim() === "") {
      setDashboardData((prev) => ({
        ...prev,
        customers: [...prev.allCustomers],
        currentPage: 1,
      }));
      return;
    }

    const timer = setTimeout(() => {
      searchCustomers();
    }, 300);

    return () => clearTimeout(timer);
  }, [dashboardData.searchKey]);

  const searchCustomers = () => {
    const searchTerm = dashboardData.searchKey.toLowerCase();
    
    const filtered = dashboardData.allCustomers.filter(customer => 
      customer.member_id.toLowerCase().includes(searchTerm) ||
      `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm) ||
      customer.contact_no.includes(dashboardData.searchKey)
    );
    
    setDashboardData(prev => ({
      ...prev,
      customers: filtered,
      currentPage: 1
    }));
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setDashboardData((prev) => ({ ...prev, searchKey: value }));
  };

  const handleSearchKeyUp = (e) => {
    if (e.key === "Enter") {
      searchCustomers();
    }
  };

  // Pagination logic
  const paginatedCustomers = useMemo(() => {
    const startIndex = (dashboardData.currentPage - 1) * dashboardData.itemsPerPage;
    return dashboardData.customers.slice(
      startIndex,
      startIndex + dashboardData.itemsPerPage
    );
  }, [dashboardData.customers, dashboardData.currentPage, dashboardData.itemsPerPage]);

  const totalPages = Math.ceil(
    dashboardData.customers.length / dashboardData.itemsPerPage
  );

  const handlePageChange = (page) => {
    setDashboardData((prev) => ({ ...prev, currentPage: page }));
  };

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
      width: "13rem",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    closed: {
      x: "-100%",
      width: "13rem",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const contentVariants = {
    open: { marginLeft: "13rem" },
    closed: { marginLeft: "0" },
  };

  // Skeleton loading component
  const renderSkeleton = () => (
    <div className="p-4 mt-16">
      <div className="mb-4">
        <Skeleton height={30} width={200} />
        <Skeleton height={20} width={150} />
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 mb-4`}>
        {[1, 2, 3, ...(isAdmin ? [4] : [])].map((item) => (
          <div key={item} className="bg-white rounded-lg shadow p-4">
            <Skeleton height={80} />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <Skeleton height={40} />
        </div>

        <div className="p-4 border-b">
          <Skeleton height={30} width={150} />
        </div>

        <div className="overflow-x-auto">
          <Skeleton height={300} />
        </div>
      </div>
    </div>
  );

  const renderDashboardContent = () => (
    <div className="p-4 mt-16">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to Viwahaa</p>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 mb-4`}>
        {/* Profile Count Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{dashboardData.profileCount}</h2>
              <p className="text-gray-600">Profiles</p>
              <p className="text-sm text-gray-500 mt-1">Total Customers</p>
            </div>
            <FaUser className="text-3xl text-purple-500" />
          </div>
        </div>

        {/* Bookings Count Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{dashboardData.bookingsCount}</h2>
              <p className="text-gray-600">Bookings</p>
              <p className="text-sm text-gray-500 mt-1">Total Plan Request</p>
            </div>
            <FaCalendarAlt className="text-3xl text-green-500" />
          </div>
        </div>

        {/* Interest Count Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{dashboardData.intrestCount}</h2>
              <p className="text-gray-600">Interested</p>
              <p className="text-sm text-gray-500 mt-1">People Interested</p>
            </div>
            <FaHeart className="text-3xl text-red-500" />
          </div>
        </div>

        {/* Earnings Card - Only for Admin */}
        {isAdmin && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{formattedEarnings}</h2>
                <p className="text-gray-600">Total Earnings</p>
                <p className="text-sm text-gray-500 mt-1">Revenue</p>
              </div>
              <FaMoneyBill className="text-3xl text-blue-500" />
            </div>
          </div>
        )}
      </div>

      {/* Customers Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative w-full max-w-lg mx-auto">
            <input
              type="text"
              className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search customers..."
              value={dashboardData.searchKey}
              onChange={handleSearchChange}
              onKeyUp={handleSearchKeyUp}
            />
            <button
              onClick={searchCustomers}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none"
            >
              <FaSearch className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Customers</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="bg-white shadow rounded-lg">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Member ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Email
                  </th>
                  {/* Contact Number Column - Only for Admin */}
                  {isAdmin && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Number
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="text-sm">
                {paginatedCustomers.map((customer, index) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {(dashboardData.currentPage - 1) * dashboardData.itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {customer.member_id}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {customer.first_name} {customer.last_name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {customer.email}
                    </td>
                    {/* Contact Number Data - Only for Admin */}
                    {isAdmin && (
                      <td className="px-4 py-3 text-gray-500">
                        {customer.contact_no}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => handlePageChange(Math.max(1, dashboardData.currentPage - 1))}
              disabled={dashboardData.currentPage === 1}
              className="mx-1 px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            >
              <FaChevronLeft />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (dashboardData.currentPage <= 3) {
                pageNum = i + 1;
              } else if (dashboardData.currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = dashboardData.currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`mx-1 px-3 py-1 rounded ${
                    dashboardData.currentPage === pageNum
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(Math.min(totalPages, dashboardData.currentPage + 1))}
              disabled={dashboardData.currentPage === totalPages}
              className="mx-1 px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    if (dashboardData.loading && activeSection === "dashboard") {
      return renderSkeleton();
    }

    return (
      <Suspense fallback={renderSkeleton()}>
        {activeSection === "profile" && <AdminProfiles />}
        {activeSection === "bookings" && <AdminPackageBookings />}
        {activeSection === "interested" && <AdminInterested />}
        {activeSection === "profileinterested" && <AdminProfileInterested />}
        {activeSection === "staff" && <AdminStaff />}
        {activeSection === "dashboard" && renderDashboardContent()}
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
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