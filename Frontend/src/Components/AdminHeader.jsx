import React, { useEffect, useState } from "react";
import { FaBars, FaSearch, FaExpandAlt, FaCompressAlt } from "react-icons/fa";
import { ChevronDown, Settings, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signOut } from "../redux/user/userSlice";
import { motion } from "framer-motion";

function AdminHeader({ onToggleSidebar }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState("Admin");
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
          // Set display name based on user type
          if (parsedUser.user_type_id === 3) {
            setUserName("Staff");
          } else {
            setUserName("Admin");
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
    return userType === 3 ? "Staff" : "Admin";
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
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-300 text-white flex items-center justify-between px-10 shadow-md">
      {/* Logo and Title */}
      <div className="flex items-center">
        <span className="ml-2 text-md font-workSans mr-3">
          {getDisplayName()} Panel
        </span>
        <div>
          <motion.button
            className="p-2 hover:bg-yellow-600 rounded-md"
            onClick={onToggleSidebar}
            whileTap={{ scale: 0.95 }}
          >
            <FaBars className="text-sm" />
          </motion.button>

          {/* Search Icon */}
          <button className="p-2 hover:bg-yellow-600 rounded-md">
            <FaSearch className="text-sm" />
          </button>

          {/* Full-screen Icon */}
          <button
            className="p-2 hover:bg-yellow-600 rounded-md"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <FaCompressAlt className="text-sm" />
            ) : (
              <FaExpandAlt className="text-sm" />
            )}
          </button>
        </div>
      </div>

      {/* Icons Section */}
      <div className="flex items-center space-x-4">
        {/* User Dropdown */}
        <div className="relative">
          <button
            className="flex items-center space-x-1 bg-yellow-400 py-2 px-4 rounded-md"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{userName}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Dropdown Menu - now visible when isDropdownOpen is true */}
          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-md"
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <ul>
                {/* User info in dropdown */}
                <li className="px-4 py-2 border-b border-gray-200 text-sm">
                  <div className="font-semibold">{userName}</div>
                  <div className="text-gray-600">{getDisplayName()} User</div>
                </li>
                
                {/* <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </li> */}
                <button onClick={handleLogout} className="w-full">
                  <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 hover:cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </li>
                </button>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminHeader;