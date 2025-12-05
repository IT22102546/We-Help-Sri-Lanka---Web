import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaHeart,
  FaHome,
  FaUsers,
} from "react-icons/fa";
import logo from "../assets/Logo/logo.jpg";

const DashSideBar = ({ onNavItemClick, activeSection }) => {
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user type from localStorage
  useEffect(() => {
    const checkUserType = () => {
      try {
        // Method 1: Check from user data stored in localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserType(parsedUser.user_type_id);
        }
        // Method 2: Check from specific flags
        else if (localStorage.getItem("isStaff") === "true") {
          setUserType(3); // Staff user_type_id
        } else if (localStorage.getItem("isAdmin") === "true") {
          setUserType(1); // Admin user_type_id
        }
        // Method 3: Check userTypeId directly
        else {
          const userTypeId = localStorage.getItem("userTypeId");
          if (userTypeId) {
            setUserType(parseInt(userTypeId));
          }
        }
      } catch (error) {
        console.error("Error checking user type:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserType();
  }, []);

  // If user type is Staff (user_type_id = 3), hide Staff Management and Package Bookings
  const isStaff = userType === 3;

  if (loading) {
    return (
      <div className="w-52 h-full bg-white p-2 pt-0 pl-0 rounded-r-lg shadow-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-52 h-full bg-white p-2 pt-0 pl-0 rounded-r-lg shadow-lg">
      {/* Logo and Title */}
      <div className="text-black text-2xl font-semibold flex flex-col items-center mb-8 pt-14">
        <img src={logo} alt="Logo" className="mr-2 rounded-full w-12 h-12" />
        <span className="ml-2 text-sm text-dark">
          {isStaff ? "Staff" : "Admin"}
        </span>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-4 pl-1">
        {/* Dashboard Link */}
        <div className="text-black">
          <button
            onClick={() => onNavItemClick("dashboard")}
            className={`block px-4 py-3 rounded-lg w-full text-xs text-left transition duration-300 font-workSans ${
              activeSection === "dashboard"
                ? "bg-yellow-200"
                : "hover:bg-yellow-300"
            }`}
          >
            <FaHome className="mr-3 inline" /> Dashboard
          </button>
        </div>

        <hr />

        {/* Staff Management Link - Only show if user is NOT Staff */}
        {!isStaff && (
          <>
            <div className="text-black">
              <button
                onClick={() => onNavItemClick("staff")}
                className={`block px-4 py-3 rounded-lg w-full text-xs text-left transition duration-300 font-workSans ${
                  activeSection === "staff"
                    ? "bg-yellow-200"
                    : "hover:bg-yellow-300"
                }`}
              >
                <FaUsers className="mr-3 inline" /> Staff Management
              </button>
            </div>
            <hr />
          </>
        )}

        {/* Profile Link */}
        {/* <div className="text-black">
          <button
            onClick={() => onNavItemClick("profile")}
            className={`block px-4 py-3 rounded-lg w-full text-xs text-left transition duration-300 font-workSans ${
              activeSection === "profile"
                ? "bg-yellow-200"
                : "hover:bg-yellow-300"
            }`}
          >
            <FaUser className="mr-3 inline" /> Profile
          </button>
        </div> */}

        <hr />

        {/* Package Bookings Link - Only show if user is NOT Staff */}
        {!isStaff && (
          <>
            <div className="text-black">
              <button
                onClick={() => onNavItemClick("bookings")}
                className={`block px-4 py-3 rounded-lg w-full text-xs text-left transition duration-300 font-workSans ${
                  activeSection === "bookings"
                    ? "bg-yellow-200"
                    : "hover:bg-yellow-300"
                }`}
              >
                <FaCalendarAlt className="mr-3 inline" /> Donation Requests
              </button>
            </div>
            <hr />
          </>
        )}

        {/* Interested Link */}
        {/* <div className="text-black">
          <button
            onClick={() => onNavItemClick("interested")}
            className={`block px-4 py-3 rounded-lg w-full text-xs text-left transition duration-300 font-workSans ${
              activeSection === "interested"
                ? "bg-yellow-200"
                : "hover:bg-yellow-300"
            }`}
          >
            <FaHeart className="mr-3 inline" /> Interested
          </button>
        </div> */}
        {/* <hr /> */}

        {/* Profile Interested Link */}
        {/* <div className="text-black">
          <button
            onClick={() => onNavItemClick("profileinterested")}
            className={`block px-4 py-3 rounded-lg w-full text-xs text-left transition duration-300 font-workSans ${
              activeSection === "profileinterested"
                ? "bg-yellow-200"
                : "hover:bg-yellow-300"
            }`}
          >
            <FaHeart className="mr-3 inline" /> Profile Interested
          </button>
        </div> */}
        {/* <hr /> */}
      </nav>
    </div>
  );
};

export default DashSideBar;
