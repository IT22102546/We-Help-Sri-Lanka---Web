import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaHeart,
  FaHome,
  FaUsers,
  FaCrown,
  FaBitcoin,
  FaGifts,
  FaUserLock,
  FaTruck
} from "react-icons/fa";
import logo from "../assets/Logo/logo.png";

const DashSideBar = ({ onNavItemClick, activeSection }) => {
  const [userType, setUserType] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user type and role from localStorage
  useEffect(() => {
    const checkUserType = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserType(parsedUser.user_type_id);
          setUserRole(parsedUser.role || parsedUser.status);
        }
      } catch (error) {
        console.error("Error checking user type:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserType();
  }, []);

  // Check if user is SuperAdmin
  const isSuperAdmin =
    userRole === "superAdmin" || userRole === "SuperAdmin" || userType === 1;

  // Check if user is Staff
  const isStaff = userType === 3;

  // Get status color
  const getStatusColor = () => {
    if (isSuperAdmin) return "bg-gradient-to-r from-red-500 to-yellow-500";
    return "bg-gradient-to-r from-blue-500 to-green-500";
  };

  if (loading) {
    return (
      <div className="w-64 h-full bg-gradient-to-b from-blue-50 to-white border-r border-gray-200 p-2 pt-0 pl-0 shadow-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-64 h-full bg-gradient-to-b from-blue-50 to-white border-r border-gray-200 p-2 pt-0 pl-0 shadow-lg">
      {/* Logo and Title - Updated for rectangular logo */}
      <div className="flex flex-col items-center mb-8 pt-14 mt-10">
        {/* Logo Container */}
        <div className="relative mb-3">
          {/* Background with proper aspect ratio for rectangular logo */}
          <div
            className={`flex items-center justify-center p-2 ${getStatusColor()} rounded-lg shadow-sm`}
          >
            {/* Logo Image - Rectangular version */}
            <img
              src={logo}
              alt="We Help Sri Lanka Logo"
              className="h-12 w-auto max-w-[120px] object-contain"
            />
          </div>
          {/* Super Admin Crown Badge */}
          {isSuperAdmin && (
            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 border-2 border-white shadow-sm">
              <FaCrown className="text-white text-xs" />
            </div>
          )}
        </div>

        {/* User Role Title */}
        <span className="text-lg font-semibold text-gray-800">
          {isSuperAdmin ? "Super Admin" : isStaff ? "Staff" : "Admin"}
        </span>

        {/* Organization Name */}
        <span className="text-sm text-gray-600 mt-1">We Help Sri Lanka</span>

        {/* Relief Operations Tagline */}
        <span className="text-xs text-gray-500 mt-1">Relief Operations</span>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1 px-2">
        {/* Dashboard Link */}
        <button
          onClick={() => onNavItemClick("dashboard")}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
            activeSection === "dashboard"
              ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <FaHome className="mr-3 h-5 w-5" />
          <span className="font-medium">Dashboard</span>
        </button>

        {/* Admin Management Link - Only show if user is SuperAdmin */}
        {isSuperAdmin && (
          <button
            onClick={() => onNavItemClick("staff")}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
              activeSection === "staff"
                ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <FaUserLock className="mr-3 h-5 w-5" />
            <span className="font-medium">Admin Management</span>
          </button>
        )}

        {/* Donation Request Link */}
        <button
          onClick={() => onNavItemClick("bookings")}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
            activeSection === "bookings"
              ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <FaUser className="mr-3 h-5 w-5" />
          <span className="font-medium">Disaster AID Requests</span>
        </button>

        {/* Donation Request Link */}
        <button
          onClick={() => onNavItemClick("organizationAdmin")}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
            activeSection === "organizationAdmin"
              ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <FaUsers className="mr-3 h-5 w-5" />
          <span className="font-medium">Donation Requests</span>
        </button>

         <button
          onClick={() => onNavItemClick("TransportProviders")}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
            activeSection === "TransportProviders"
              ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <FaTruck className="mr-3 h-5 w-5" />
          <span className="font-medium">Transport Providers</span>
        </button>

        {/* Donation Request Link 
        <button
          onClick={() => onNavItemClick("donarAdminpage")}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
            activeSection === "donarAdminpage"
              ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <FaGifts className="mr-3 h-5 w-5" />
          <span className="font-medium">Donations</span>
        </button>*/}
      </nav>

      {/* User Info at Bottom - Updated for rectangular logo */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          {/* User Avatar with Logo - Rectangular version */}
          <div className="relative">
            <div
              className={`flex items-center justify-center p-1 ${getStatusColor()} rounded-lg overflow-hidden`}
            >
              <img
                src={logo}
                alt="User Avatar"
                className="h-8 w-auto max-w-[32px] object-contain"
              />
            </div>
            {/* Super Admin Badge */}
            {isSuperAdmin && (
              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 border border-white">
                <FaCrown className="text-white text-[8px]" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {isSuperAdmin ? "Super Admin" : isStaff ? "Staff" : "Admin"}
            </p>
            <p className="text-xs text-gray-500 truncate">We Help Sri Lanka</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashSideBar;