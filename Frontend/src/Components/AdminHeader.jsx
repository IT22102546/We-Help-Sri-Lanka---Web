import React, { useEffect, useState } from "react";
import { FaBars, FaSearch, FaExpandAlt, FaCompressAlt, FaCrown } from "react-icons/fa";
import { ChevronDown, Settings, LogOut, Shield } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signOut } from "../redux/user/userSlice";
import { motion } from "framer-motion";

function AdminHeader({ onToggleSidebar }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState("Admin");
  const [userEmail, setUserEmail] = useState("");
  const [userStatus, setUserStatus] = useState("admin");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check user type and name from localStorage
  useEffect(() => {
    const checkUserInfo = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserType(parsedUser.user_type_id);
          setUserEmail(parsedUser.email || "");
          
          if (parsedUser.status === "superAdmin") {
            setUserName("Super Admin");
            setUserStatus("superAdmin");
          } else if (parsedUser.status === "admin") {
            setUserName(parsedUser.name || "Admin");
            setUserStatus("admin");
          } else {
            setUserName("Admin");
            setUserStatus("admin");
          }
        } else if (localStorage.getItem('isStaff') === 'true') {
          setUserType(3);
          setUserName("Staff");
        } else if (localStorage.getItem('isAdmin') === 'true') {
          setUserType(1);
          setUserName("Admin");
        } else {
          const userTypeId = localStorage.getItem('userTypeId');
          if (userTypeId) {
            const typeId = parseInt(userTypeId);
            setUserType(typeId);
            setUserName(typeId === 3 ? "Staff" : "Admin");
          }
        }
      } catch (error) {
        console.error("Error checking user info:", error);
      }
    };

    checkUserInfo();
  }, []);

  // Determine display name based on user type
  const getDisplayName = () => {
    if (userStatus === "superAdmin") return "Super Admin";
    return userType === 3 ? "Staff" : "Admin";
  };

  // Get status color
  const getStatusColor = () => {
    if (userStatus === "superAdmin") return "bg-gradient-to-r from-red-500 to-yellow-500";
    return "bg-gradient-to-r from-blue-500 to-green-500";
  };

  // Get status badge color
  const getStatusBadgeColor = () => {
    if (userStatus === "superAdmin") return "bg-red-100 text-red-800";
    return "bg-purple-100 text-purple-800";
  };

  // Get status icon
  const getStatusIcon = () => {
    if (userStatus === "superAdmin") return <FaCrown className="h-3 w-3" />;
    return <Shield className="h-3 w-3" />;
  };

  const handleLogout = () => {
    dispatch(signOut());
    navigate("/admin-sign-in");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Menu Button */}
          <motion.button
            className="p-2 rounded-lg hover:bg-white/20"
            onClick={onToggleSidebar}
            whileTap={{ scale: 0.95 }}
          >
            <FaBars className="h-5 w-5" />
          </motion.button>

          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className={`h-8 w-8 rounded-lg ${getStatusColor()} flex items-center justify-center`}>
              <span className="text-white font-bold">SL</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Relief Operations</h1>
              <p className="text-xs opacity-80">{getDisplayName()} Panel</p>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block relative ml-4">
            <input
              type="text"
              placeholder="Search operations..."
              className="pl-10 pr-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-blue-100 text-sm w-64"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-100 h-4 w-4" />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Fullscreen Toggle */}
          <button
            className="p-2 rounded-lg hover:bg-white/20 hidden md:block"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <FaCompressAlt className="h-5 w-5" />
            ) : (
              <FaExpandAlt className="h-5 w-5" />
            )}
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/20"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs opacity-80 truncate max-w-[150px]">{userEmail}</p>
              </div>
              <div className={`h-8 w-8 rounded-full ${getStatusColor()} flex items-center justify-center text-white font-bold`}>
                {userName.charAt(0)}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white text-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-200"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                {/* User Info */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
                  <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-full ${getStatusColor()} flex items-center justify-center text-white font-bold`}>
                      {userName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{userName}</h3>
                      <p className="text-sm text-gray-600">{userEmail}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor()}`}>
                          {getStatusIcon()}
                          <span className="ml-1">{userStatus}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="py-2">
                  <a href="/admin/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Settings className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Dashboard</span>
                  </a>
                  <a href="/admin/staff" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FaCrown className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Admin Management</span>
                  </a>
                  <a href="/admin/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Settings className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Settings</span>
                  </a>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100">
                  <button onClick={handleLogout} className="w-full">
                    <div className="px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 hover:cursor-pointer">
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search operations..."
            className="w-full pl-10 pr-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-blue-100 text-sm"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-100 h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default AdminHeader;