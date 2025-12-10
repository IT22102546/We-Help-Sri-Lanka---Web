import { useState, useEffect } from "react";
import {
  MdLocationOn,
  MdPhone,
  MdPeople,
  MdAccessTime,
  MdVerified,
  MdInfo,
  MdLocalGroceryStore,
  MdClose,
  MdExpandMore,
  MdCheckCircle,
  MdArrowForward,
  MdLocationCity,
} from "react-icons/md";
import {
  FaExclamationTriangle,
  FaTruckLoading,
  FaClock,
  FaUtensils,
  FaFirstAid,
  FaWater,
  FaBaby,
  FaFemale,
  FaMale,
  FaTruck,
} from "react-icons/fa";
import { GiFamilyHouse } from "react-icons/gi";
import { BsChatTextFill } from "react-icons/bs";
import ReactDOM from 'react-dom';

// Get priority configuration
const getPriorityConfig = (priority) => {
  const prio = parseInt(priority) || 3;
  switch (prio) {
    case 5:
      return {
        color: "bg-gradient-to-r from-red-500 to-red-600",
        border: "border-red-100",
        icon: <FaExclamationTriangle className="text-white" />,
        text: "Critical",
        badge: "text-xs px-2 py-1 md:px-3 md:py-1.5",
      };
    case 4:
      return {
        color: "bg-gradient-to-r from-orange-500 to-orange-500",
        border: "border-orange-100",
        icon: <FaExclamationTriangle className="text-white" />,
        text: "High",
        badge: "text-xs px-2 py-1 md:px-3 md:py-1.5",
      };
    case 3:
      return {
        color: "bg-gradient-to-r from-yellow-500 to-yellow-600",
        border: "border-yellow-100",
        icon: <FaClock className="text-white" />,
        text: "Medium",
        badge: "text-xs px-2 py-1 md:px-3 md:py-1.5",
      };
    case 2:
      return {
        color: "bg-gradient-to-r from-blue-500 to-blue-600",
        border: "border-blue-100",
        icon: <FaClock className="text-white" />,
        text: "Low",
        badge: "text-xs px-2 py-1 md:px-3 md:py-1.5",
      };
    case 1:
      return {
        color: "bg-gradient-to-r from-green-500 to-green-600",
        border: "border-green-100",
        icon: <MdInfo className="text-white" />,
        text: "Normal",
        badge: "text-xs px-2 py-1 md:px-3 md:py-1.5",
      };
    default:
      return {
        color: "bg-gradient-to-r from-gray-500 to-gray-600",
        border: "border-gray-100",
        icon: <MdInfo className="text-white" />,
        text: "Normal",
        badge: "text-xs px-2 py-1 md:px-3 md:py-1.5",
      };
  }
};

// Get status configuration
const getStatusConfig = (status) => {
  const stat = status?.toLowerCase() || "pending";
  switch (stat) {
    case "received":
    case "already received":
      return {
        color: "bg-emerald-50 border-emerald-200 text-emerald-700",
        icon: <MdCheckCircle className="text-emerald-600" />,
        displayText: "Received",
      };
    case "linked a supplier":
      return {
        color: "bg-blue-50 border-blue-200 text-blue-700",
        icon: <FaTruckLoading className="text-blue-600" />,
        displayText: "Linked Supplier",
      };
    case "fake":
      return {
        color: "bg-red-50 border-red-200 text-red-700",
        icon: <FaExclamationTriangle className="text-red-600" />,
        displayText: "Fake",
      };
    case "not yet received":
    case "pending":
    case "not received":
      return {
        color: "bg-amber-50 border-amber-200 text-amber-700",
        icon: <FaClock className="text-amber-600" />,
        displayText: "Not Yet Received",
      };
    default:
      return {
        color: "bg-amber-50 border-amber-200 text-amber-700",
        icon: <FaClock className="text-amber-600" />,
        displayText: status || "Pending",
      };
  }
};

// Get requirement icons
const getRequirementIcon = (req) => {
  const reqLower = req.toLowerCase();
  if (reqLower.includes("food") || reqLower.includes("meal"))
    return <FaUtensils className="text-amber-600 text-xs md:text-sm" />;
  if (reqLower.includes("water"))
    return <FaWater className="text-blue-500 text-xs md:text-sm" />;
  if (reqLower.includes("medical") || reqLower.includes("medicine"))
    return <FaFirstAid className="text-red-500 text-xs md:text-sm" />;
  if (reqLower.includes("baby") || reqLower.includes("infant"))
    return <FaBaby className="text-pink-500 text-xs md:text-sm" />;
  if (reqLower.includes("women"))
    return <FaFemale className="text-purple-500 text-xs md:text-sm" />;
  if (reqLower.includes("men")) return <FaMale className="text-blue-500 text-xs md:text-sm" />;
  if (reqLower.includes("shelter"))
    return <GiFamilyHouse className="text-green-600 text-xs md:text-sm" />;
  return <MdLocalGroceryStore className="text-gray-500 text-xs md:text-sm" />;
};

// Format for short display like "Dec 5"
const formatTime = (timestamp) => {
  if (!timestamp) return "Just now";
  
  try {
    let date;
    
    // Handle Firestore timestamp format
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      const parts = timestamp.split(/[-/]/);
      if (parts.length >= 3 && parts[0].length === 4) {
        const year = parseInt(parts[0], 10);
        const day = parseInt(parts[1], 10);
        const month = parseInt(parts[2], 10) - 1;
        date = new Date(year, month, day);
      } else {
        date = new Date(timestamp);
      }
    } else {
      date = new Date(timestamp);
    }
    
    if (isNaN(date.getTime())) {
      return "Invalid";
    }
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthName = monthNames[date.getMonth()];
    const day = date.getDate();
    
    return `${monthName} ${day}`;
  } catch (error) {
    return "Invalid date";
  }
};

// Format for modal display
const formatDate = (dateString) => {
  if (!dateString) return "-";
  
  try {
    let date;
    
    if (dateString.seconds) {
      date = new Date(dateString.seconds * 1000);
    } else if (dateString.toDate) {
      date = dateString.toDate();
    } else if (typeof dateString === 'string') {
      const parts = dateString.split(/[-/]/);
      if (parts.length >= 3 && parts[0].length === 4) {
        const year = parseInt(parts[0], 10);
        const day = parseInt(parts[1], 10);
        const month = parseInt(parts[2], 10) - 1;
        date = new Date(year, month, day);
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

// Truncate text with ellipsis
const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export default function Listings({ item }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRequirements, setExpandedRequirements] = useState(false);
  const [expandedAddress, setExpandedAddress] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const priorityConfig = getPriorityConfig(item.priority);
  const statusConfig = getStatusConfig(item.status);

  // Check if address is long (more than 30 characters)
  const isAddressLong = item.address && item.address.length > 30;
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Google Sheets URL for transport providers
  const transportSheetUrl = "https://docs.google.com/spreadsheets/d/1Mv7sSDaGTK7pjzBT9vYvI_4xY7hCC8U4ggF_KbOSeTQ/edit?usp=drivesdk";

  const handleTransportProviderClick = () => {
    window.open(transportSheetUrl, "_blank");
  };

  // Create portal for modal
  const ModalPortal = ({ children }) => {
    if (!mounted) return null;
    
    return ReactDOM.createPortal(
      children,
      document.getElementById('modal-root') || document.body
    );
  };

  return (
    <>
      {/* Card with consistent height - Fixed for mobile */}
      <div className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg hover:shadow-xl transition-all duration-300 p-3 md:p-5 border border-gray-100 group h-full flex flex-col min-h-[320px] md:min-h-[340px] lg:min-h-[360px]">
        {/* Priority Badge */}
        <div
          className={`${priorityConfig.color} ${priorityConfig.badge} rounded-lg flex items-center justify-center gap-1 text-white font-semibold shadow-sm mb-3 md:mb-4 w-fit`}
        >
          {priorityConfig.icon}
          <span className="text-xs">{priorityConfig.text}</span>
        </div>

        {/* Header Section */}
        <div className="flex items-start gap-2 md:gap-3 mb-3 md:mb-4 flex-shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0">
            {item.name?.charAt(0) || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base md:text-lg group-hover:text-emerald-700 transition-colors truncate">
              {item.name || "Anonymous Request"}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              ID: {item._id?.slice(-6) || "N/A"}
            </p>
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4 flex-shrink-0">
          <div className="flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 bg-gray-50 rounded-lg">
            <MdLocationOn className="text-red-500 text-sm md:text-lg flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">District</p>
              <p className="font-medium text-gray-900 text-xs md:text-sm truncate">
                {item.district || "Unknown"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 bg-gray-50 rounded-lg">
            <MdPeople className="text-blue-500 text-sm md:text-lg flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">People</p>
              <p className="font-medium text-gray-900 text-xs md:text-sm truncate">
                {item.numberOfPeople || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 bg-gray-50 rounded-lg">
            <MdPhone className="text-green-500 text-sm md:text-lg flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">Contact</p>
              <p className="font-medium text-gray-900 text-xs md:text-sm truncate">
                {item.phone?.[0] ? item.phone[0].slice(-8) : "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 bg-gray-50 rounded-lg">
            <MdAccessTime className="text-purple-500 text-sm md:text-lg flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Posted</p>
              <p className="font-medium text-gray-900 text-xs md:text-sm truncate">
                {formatTime(item.timestamp)}
              </p>
            </div>
          </div>
        </div>

        {/* Address Section - Added to card */}
        {item.address && (
          <div className="mb-3 md:mb-4 flex-grow-0">
            <div className="flex items-start gap-1.5 md:gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg border border-gray-200">
              <MdLocationCity className="text-gray-600 text-sm md:text-base flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Address</p>
                <p className="text-xs md:text-sm font-medium text-gray-900 leading-tight">
                  {expandedAddress ? item.address : truncateText(item.address, 60)}
                </p>
                {isAddressLong && !expandedAddress && (
                  <button
                    type="button"
                    onClick={() => setExpandedAddress(true)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-1 flex items-center gap-0.5"
                  >
                    <MdExpandMore className="text-xs" />
                    Read more
                  </button>
                )}
                {expandedAddress && isAddressLong && (
                  <button
                    type="button"
                    onClick={() => setExpandedAddress(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium mt-1 flex items-center gap-0.5"
                  >
                    <MdExpandMore className="text-xs rotate-180" />
                    Show less
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status & Verification */}
        <div className="flex items-center justify-between mb-3 md:mb-4 p-2 md:p-3 bg-gray-50 rounded-lg flex-shrink-0">
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            <div
              className={`px-2 py-1 md:px-3 md:py-1 rounded-full border flex items-center gap-1.5 md:gap-2 ${statusConfig.color} text-xs md:text-sm`}
            >
              {statusConfig.icon}
              <span className="font-medium truncate max-w-[80px] md:max-w-none">
                {statusConfig.displayText}
              </span>
            </div>
            {item.verified && (
              <div className="flex items-center gap-0.5 md:gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                <MdVerified className="text-xs" />
                <span className="text-xs font-medium">Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Requirements Preview - Fixed overflow issue */}
        {item.requirements &&
          Array.isArray(item.requirements) &&
          item.requirements.length > 0 && (
            <div className="mb-3 md:mb-4 flex-grow min-h-0 overflow-hidden">
              <p className="text-xs text-gray-500 mb-1.5 md:mb-2 font-medium">
                Requirements
              </p>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {item.requirements
                  .slice(0, expandedRequirements ? item.requirements.length : 2)
                  .map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-lg max-w-full"
                    >
                      <div className="flex-shrink-0">
                        {getRequirementIcon(req)}
                      </div>
                      <span className="text-xs md:text-sm font-medium text-emerald-800 truncate max-w-[70px] md:max-w-[90px] lg:max-w-[110px]">
                        {req}
                      </span>
                    </div>
                  ))}
                {item.requirements.length > 2 && !expandedRequirements && (
                  <button
                    type="button"
                    onClick={() => setExpandedRequirements(true)}
                    className="px-2 py-1 md:px-3 md:py-1.5 text-xs text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-0.5 md:gap-1"
                  >
                    <MdExpandMore className="text-xs md:text-sm" /> 
                    +{item.requirements.length - 2}
                  </button>
                )}
                {expandedRequirements && item.requirements.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setExpandedRequirements(false)}
                    className="px-2 py-1 md:px-3 md:py-1.5 text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-0.5 md:gap-1"
                  >
                    <MdExpandMore className="text-xs md:text-sm rotate-180" /> 
                    Show less
                  </button>
                )}
              </div>
            </div>
          )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-3 md:pt-4 border-t border-gray-100 mt-auto">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg font-medium hover:from-gray-800 hover:to-gray-900 transition-all duration-300 flex items-center justify-center gap-1.5 md:gap-2 shadow-md hover:shadow-lg text-sm md:text-base"
          >
            <MdInfo className="text-base md:text-lg" />
            View Details
          </button>
        </div>
      </div>

      {/* Mobile Responsive Modal */}
      <ModalPortal>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
              onClick={() => setIsModalOpen(false)}
            />
            
            {/* Modal Container */}
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-2 sm:p-4 overflow-y-auto pointer-events-none">
              <div className="relative w-full max-w-full sm:max-w-4xl my-4 sm:my-8 pointer-events-auto max-h-[90vh]">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden h-full">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 sm:p-6 flex-shrink-0">
                    <div className="flex justify-between items-start gap-2 sm:gap-3">
                      <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl flex-shrink-0">
                          {item.name?.charAt(0) || "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-lg sm:text-2xl font-bold break-words line-clamp-2">
                            {item.name || "Anonymous Request"}
                          </h2>
                          <p className="text-gray-300 text-xs sm:text-sm truncate mt-1">
                            ID: {item._id?.slice(-8)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-300 hover:text-white transition-colors p-1 sm:p-2 hover:bg-white/10 rounded-lg flex-shrink-0 ml-1"
                        aria-label="Close modal"
                      >
                        <MdClose className="text-xl sm:text-2xl" />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Body */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                      {/* Priority & Status Section */}
                      <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
                        <div
                          className={`${priorityConfig.color} text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg flex items-center gap-1.5 sm:gap-3 font-semibold text-sm sm:text-base`}
                        >
                          {priorityConfig.icon}
                          <div>
                            <div className="text-xs opacity-90">Priority</div>
                            <div>{priorityConfig.text}</div>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg flex items-center gap-1.5 sm:gap-3 ${statusConfig.color} font-medium text-sm sm:text-base`}
                        >
                          {statusConfig.icon}
                          <div>
                            <div className="text-xs opacity-90">Status</div>
                            <div className="truncate max-w-[100px] sm:max-w-none">{statusConfig.displayText}</div>
                          </div>
                        </div>
                        {item.verified && (
                          <div className="px-2 py-1.5 sm:px-4 sm:py-2.5 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-1 sm:gap-2 font-medium border border-emerald-200 text-sm sm:text-base">
                            <MdVerified className="text-lg sm:text-xl" />
                            <div>
                              <div className="text-xs">Verified</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Main Information Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Left Column */}
                        <div className="space-y-4 sm:space-y-6">
                          {/* Location Details */}
                          <div className="bg-gray-50 p-3 sm:p-5 rounded-lg sm:rounded-xl border border-gray-200">
                            <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                              <MdLocationOn className="text-red-500 text-lg sm:text-xl" />
                              Location
                            </h3>
                            <div className="space-y-2 sm:space-y-4">
                              <div>
                                <label className="text-xs sm:text-sm text-gray-500">District</label>
                                <p className="font-medium text-gray-900 text-base sm:text-lg mt-0.5">
                                  {item.district || "Not specified"}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs sm:text-sm text-gray-500">Address</label>
                                <p className="font-medium text-gray-900 mt-0.5 text-sm sm:text-base leading-relaxed">
                                  {item.address || "Address not provided"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Family Details */}
                          <div className="bg-gray-50 p-3 sm:p-5 rounded-lg sm:rounded-xl border border-gray-200">
                            <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                              <MdPeople className="text-blue-500 text-lg sm:text-xl" />
                              Family Details
                            </h3>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <label className="text-xs sm:text-sm text-gray-500">People</label>
                                <p className="font-medium text-gray-900 text-xl sm:text-2xl mt-0.5">
                                  {item.numberOfPeople || "N/A"}
                                </p>
                              </div>
                              {item.time && (
                                <div>
                                  <label className="text-xs sm:text-sm text-gray-500">Time</label>
                                  <p className="font-medium text-gray-900 mt-0.5 text-sm sm:text-base">
                                    {item.time}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4 sm:space-y-6">
                          {/* Contact Information - FIXED PHONE LINKS */}
                          {item.phone &&
                            Array.isArray(item.phone) &&
                            item.phone.length > 0 && (
                              <div className="bg-green-50 p-3 sm:p-5 rounded-lg sm:rounded-xl border border-green-200">
                                <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                                  <MdPhone className="text-green-600 text-lg sm:text-xl" />
                                  Contact
                                </h3>
                                <div className="space-y-2 sm:space-y-3">
                                  {item.phone.map((num, idx) => (
                                    <a
                                      key={idx}
                                      href={`tel:${num}`}
                                      // ANTI-CURRENCY ATTRIBUTES ADDED HERE
                                      data-action="none"
                                      data-role="none"
                                      data-type="none"
                                      data-bwsignore="true"
                                      data-lpignore="true"
                                      data-1p-ignore="true"
                                      data-form-type="none"
                                      className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-green-100 hover:border-green-300 transition-colors group anti-currency-link"
                                    >
                                      <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                          <MdPhone className="text-green-600" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-gray-900 text-sm">Contact {idx + 1}</p>
                                          <p className="text-green-600 font-semibold text-sm sm:text-base">{num}</p>
                                        </div>
                                      </div>
                                      <MdArrowForward className="text-gray-400 group-hover:text-green-600 transition-colors text-lg" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Timestamps */}
                          <div className="bg-blue-50 p-3 sm:p-5 rounded-lg sm:rounded-xl border border-blue-200">
                            <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-3 sm:mb-4">
                              Timeline
                            </h3>
                            <div className="space-y-2 sm:space-y-3">
                              <div>
                                <label className="text-xs sm:text-sm text-gray-500">Requested On</label>
                                <p className="font-medium text-gray-900 text-sm sm:text-base">
                                  {formatDate(item.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Requirements Section */}
                      {item.requirements && Array.isArray(item.requirements) && (
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 sm:p-5 rounded-lg sm:rounded-xl border border-emerald-200">
                          <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                            <MdLocalGroceryStore className="text-emerald-600 text-lg sm:text-xl" />
                            Requirements
                          </h3>
                          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                            {item.requirements.map((req, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 sm:p-3 bg-white rounded-lg border border-emerald-100 hover:border-emerald-300 transition-colors"
                              >
                                <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                                  {getRequirementIcon(req)}
                                </div>
                                <span className="font-medium text-emerald-900 text-xs sm:text-sm truncate flex-1">
                                  {req}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Additional Notes */}
                      {item.notes && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-5 rounded-lg sm:rounded-xl border border-blue-200">
                          <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                            <BsChatTextFill className="text-blue-500 text-lg sm:text-xl" />
                            Notes
                          </h3>
                          <div className="p-3 sm:p-4 bg-white/80 rounded-lg">
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                              "{item.notes}"
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Transport Provider Section */}
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3 sm:p-5 rounded-lg sm:rounded-xl border border-orange-200">
                        <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-2 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                          <FaTruck className="text-orange-500 text-lg sm:text-xl" />
                          Transport Help?
                        </h3>
                        <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                          Find registered transport providers in your area.
                        </p>
                        <button
                          type="button"
                          onClick={handleTransportProviderClick}
                          className="w-full px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                        >
                          <FaTruck className="text-lg sm:text-xl" />
                          Find Transport
                          <MdArrowForward className="text-lg sm:text-xl" />
                        </button>
                        <p className="text-xs text-gray-500 mt-2 sm:mt-3 text-center">
                          Opens Google Sheets
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer - FIXED PHONE LINK */}
                  <div className="p-3 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-full sm:w-auto text-sm sm:text-base"
                      >
                        Close
                      </button>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        {item.phone?.[0] && (
                          <a
                            href={`tel:${item.phone[0]}`}
                            // ANTI-CURRENCY ATTRIBUTES
                            data-action="none"
                            data-role="none"
                            data-type="none"
                            data-bwsignore="true"
                            data-lpignore="true"
                            data-1p-ignore="true"
                            data-form-type="none"
                            className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base anti-currency-link"
                          >
                            <MdPhone className="text-lg sm:text-xl" />
                            Call Now
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </ModalPortal>
    </>
  );
}