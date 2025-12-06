import React, { useEffect, useState } from "react";
import { FaBars, FaSearch, FaExpandAlt, FaCompressAlt, FaCrown } from "react-icons/fa";
import logo from '../assets/Logo/logowhite.png';

function Header({ onToggleSidebar }) {
  
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      <div className="flex items-center justify-between px-1 py-1 md:px-8">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
            <div className="relative mb-6 md:mb-8 z-10">
                  <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-1 md:p-6 shadow-lg">
                    <img
                      src={logo}
                      alt="We Help Sri Lanka Logo"
                      className="h-5 md:h-8"
                    />
                  </div>
          
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

export default Header;