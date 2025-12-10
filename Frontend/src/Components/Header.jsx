import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPhone,
  FaHeart,
  FaGlobe,
  FaHandHoldingHeart,
  FaUsers,
  FaLeaf,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaTruck,
  FaClock,
  FaShieldAlt,
  FaDonate,
} from "react-icons/fa";
import logo from '../assets/Logo/logowhite.png';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setShowStats(window.scrollY < 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePhoneClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Direct call on mobile, alert on desktop
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      // For mobile devices, use tel: link
      window.location.href = 'tel:+94771000459';
    } else {
      // For desktop, show number
      alert('Phone: 0771000459 (Hansini)\nOn a mobile device, this would open your phone dialer.');
    }
  };

  const stats = [
    { value: "350+", label: "Active Requests", icon: FaHeart, color: "text-red-400" },
    { value: "8,567+", label: "People Helped", icon: FaUsers, color: "text-green-400" },
    { value: "24", label: "Districts", icon: FaGlobe, color: "text-blue-400" },
    { value: "100%", label: "Verified", icon: FaShieldAlt, color: "text-emerald-400" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: FaFacebook,
      url: "https://www.facebook.com/share/p/17cZ6DZbAM/?mibextid=wwXIfr"
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      url: "https://www.instagram.com/p/DRzgyrfEup8/?igsh=ejdmaWR5M3MwcWMx"
    },
    {
      name: "WhatsApp Channel",
      icon: FaWhatsapp,
      url: "https://whatsapp.com/channel/0029VbBqS9qIyPtOpKOwJL0u"
    }
  ];

  const handleSocialClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Main Header */}
      <motion.div 
        className={`transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-xl text-gray-800' 
            : 'bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-700 text-white'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 md:px-8 py-3 md:py-4">
          <div className="max-w-7xl mx-auto">
            {/* Top Row: Logo & Quick Actions */}
            <div className="flex items-center justify-between mb-4">
              {/* Logo & Brand */}
              <motion.div 
                className="flex items-center space-x-3 md:space-x-4"
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl md:rounded-2xl p-2 md:p-3 shadow-xl md:shadow-2xl">
                    <img
                      src={logo}
                      alt="We Help Sri Lanka Logo"
                      className="h-7 md:h-10"
                    />
                  </div>
                  <motion.div 
                    className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2"
                    animate={{ rotate: [0, 360] }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  >
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-full shadow-lg">
                      <FaLeaf className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    </div>
                  </motion.div>
                </div>
                
                {/* Brand text */}
                <div className="hidden md:block">
                  <h1 className={`text-xl md:text-2xl font-bold tracking-tight ${
                    isScrolled 
                      ? 'bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent' 
                      : 'bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent'
                  }`}>
                    We Help Sri Lanka
                  </h1>
                  <p className={`text-xs md:text-sm ${
                    isScrolled ? 'text-emerald-600' : 'text-white/90'
                  } flex items-center gap-2`}>
                    <FaHandHoldingHeart className="h-3 w-3" />
                    <span>Connecting Hearts, Saving Lives</span>
                  </p>
                </div>
              </motion.div>

              {/* Right Actions */}
              <div className="flex items-center space-x-2 md:space-x-4">
                {/* Phone Number - Using onClick instead of href to prevent browser detection */}
                <motion.button
                  type="button"
                  onClick={handlePhoneClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                    isScrolled 
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                  }`}
                  // Critical: Add these attributes to prevent financial detection
                  data-action="none"
                  data-role="none"
                  data-type="button"
                  data-bwsignore="true"
                  data-lpignore="true"
                  data-form-type="other"
                  data-phone="0771000459"
                  // Prevent iOS from showing any special icon
                  style={{ 
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none'
                  }}
                >
                  <FaPhone className="h-3 w-3" />
                  <span className="font-medium">077 100 0459</span>
                  <span className="text-xs opacity-80">(Hansini)</span>
                </motion.button>

                {/* Live Stats */}
                <div className={`hidden md:flex items-center gap-2 ${
                  isScrolled 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'bg-white/10 backdrop-blur-sm text-white'
                } px-3 py-2 rounded-xl`}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-ping"></div>
                    <span className="text-sm font-medium">LIVE</span>
                  </div>
                  <span className="text-sm">Active Now</span>
                </div>

                {/* Social Media Icons */}
                <div className="flex items-center space-x-2 md:space-x-3">
                  {socialLinks.map((social, index) => (
                    <motion.button
                      key={social.name}
                      type="button"
                      className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all ${
                        isScrolled 
                          ? social.name === 'Facebook' ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : social.name === 'Instagram' ? 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSocialClick(social.url)}
                      title={social.name}
                      data-action="none"
                      data-role="none"
                      data-type="button"
                    >
                      <social.icon className="h-4 w-4 md:h-5 md:w-5" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Stats Bar */}
        <AnimatePresence>
          {showStats && !isScrolled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gradient-to-r from-emerald-800/90 to-teal-900/90 backdrop-blur-sm border-t border-white/10"
            >
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Mobile: Smaller stats, Desktop: Normal */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-6 lg:gap-8">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        className="flex items-center gap-2 md:gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className={`p-1.5 md:p-2 rounded-lg bg-white/10 ${stat.color}`}>
                          <stat.icon className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div>
                          <div className="text-base md:text-xl font-bold text-white">{stat.value}</div>
                          <div className="text-xs text-white/80">{stat.label}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Extra info */}
                  <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <FaTruck className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-white/90">Live Deliveries: 12</span>
                    </div>
                    <div className="h-4 w-px bg-white/20"></div>
                    <div className="flex items-center gap-2">
                      <FaClock className="h-4 w-4 text-yellow-300" />
                      <span className="text-sm text-white/90">
                        Last Update: <span className="font-medium">Just Now</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Donate Button for Mobile */}
      <motion.button
        type="button"
        className="md:hidden fixed bottom-6 right-6 z-40 p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
        data-action="none"
        data-role="none"
        data-type="button"
        data-bwsignore="true"
        data-lpignore="true"
        data-form-type="other"
      >
        <FaDonate className="h-5 w-5" />
      </motion.button>
    </div>
  );
}

export default Header;