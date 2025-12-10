import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DonationListing from "../Components/Listings.jsx";
import { useSelector } from "react-redux";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaAngleDown,
  FaCheck,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaSortAmountDown,
  FaSortAmountUp,
  FaHeart,
  FaUsers,
  FaShieldAlt,
  FaGlobe,
  FaClock,
  FaFire,
  FaChevronDown,
  FaChevronRight,
  FaCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Sri Lanka districts
const districts = [
  "All Districts",
  "Colombo",
  "Kandy",
  "Gampaha",
  "Kalutara",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Kilinochchi",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
  "Nuwara Eliya",
  "Matale",
];

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);
  const [donations, setDonations] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [expandedFilters, setExpandedFilters] = useState({
    status: false,
    verification: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Default sort is timestamp descending (newest first)
  const [filterData, setFilterData] = useState({
    searchTerm: "",
    status: "all",
    verified: "all",
    district: "all",
    sortBy: "timestamp",
    sortOrder: "desc",
  });

  // Status options with colors
  const statusOptions = [
    { value: "all", label: "All Status", color: "gray", icon: FaGlobe },
    { value: "Not yet received", label: "Not Yet Received", color: "orange", icon: FaClock },
    { value: "Linked a supplier", label: "Linked Supplier", color: "blue", icon: FaCheck },
    { value: "Received", label: "Received", color: "green", icon: FaCheck },
    { value: "Already received", label: "Already Received", color: "lime", icon: FaCheck },
    { value: "FAKE", label: "Fake", color: "red", icon: FaExclamationTriangle },
  ];

  // Sort options
  const sortOptions = [
    { value: "timestamp", label: "Latest", icon: FaClock },
    { value: "priority", label: "Priority", icon: FaFire },
    { value: "numberOfPeople", label: "People Count", icon: FaUsers },
  ];

  // Check if any filter is active
  const isAnyFilterActive = () => {
    return (
      filterData.searchTerm ||
      filterData.status !== "all" ||
      filterData.verified !== "all" ||
      filterData.district !== "all" ||
      filterData.sortBy !== "timestamp" ||
      filterData.sortOrder !== "desc"
    );
  };

  // Fetch donations whenever filterData or page changes
  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      try {
        const skip = (currentPage - 1) * itemsPerPage;
        const urlParams = new URLSearchParams();
        urlParams.set("skip", skip.toString());
        urlParams.set("limit", itemsPerPage.toString());
        urlParams.set("page", currentPage.toString());
        urlParams.set("sortBy", filterData.sortBy);
        urlParams.set("sortOrder", filterData.sortOrder);
        
        if (filterData.searchTerm && filterData.searchTerm.trim() !== "") {
          urlParams.set("searchTerm", filterData.searchTerm);
        }
        if (filterData.status && filterData.status !== "all") {
          urlParams.set("status", filterData.status);
        }
        if (filterData.verified && filterData.verified !== "all") {
          urlParams.set("verified", filterData.verified);
        }
        if (filterData.district && filterData.district !== "all") {
          urlParams.set("district", filterData.district);
        }

        const res = await fetch(
          `/api/donation-requests/getdonationlistings?${urlParams.toString()}`
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();

        if (result.success) {
          const allDonations = (result.data || []).map(doc => ({
            ...doc,
            _id: doc._id?.toString() || doc._id
          }));

          setDonations(allDonations);
          setTotalCount(result.total || allDonations.length);
          setTotalPages(Math.ceil((result.total || 0) / itemsPerPage));
        } else {
          setDonations([]);
          setTotalCount(0);
          setTotalPages(1);
        }

        const currentParams = new URLSearchParams(location.search);
        const newUrlParams = new URLSearchParams(urlParams);
        if (currentPage === 1) {
          newUrlParams.delete("page");
        }
        
        if (currentParams.toString() !== newUrlParams.toString()) {
          navigate(`/donations?${newUrlParams.toString()}`, { replace: true });
        }
      } catch (error) {
        console.error("Error fetching donations:", error);
        setDonations([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(
      () => {
        fetchDonations();
      },
      filterData.searchTerm ? 500 : 0
    );

    return () => clearTimeout(timer);
  }, [filterData, navigate, location.search, currentPage]);

  // Parse URL parameters on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTerm = urlParams.get("searchTerm") || "";
    const status = urlParams.get("status") || "all";
    const verified = urlParams.get("verified") || "all";
    const district = urlParams.get("district") || "all";
    const sortBy = urlParams.get("sortBy") || "timestamp";
    const sortOrder = urlParams.get("sortOrder") || "desc";
    const page = parseInt(urlParams.get("page")) || 1;

    setFilterData({
      searchTerm,
      status,
      verified,
      district,
      sortBy,
      sortOrder,
    });
    setCurrentPage(page);
  }, [location.search]);

  // Handle search input changes
  const handleSearchChange = (e) => {
    setFilterData((prev) => ({ ...prev, searchTerm: e.target.value }));
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    setFilterData((prev) => ({ ...prev, [type]: value }));
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (type) => {
    if (filterData.sortBy === type) {
      setFilterData((prev) => ({
        ...prev,
        sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
      }));
    } else {
      setFilterData((prev) => ({
        ...prev,
        sortBy: type,
        sortOrder: type === "timestamp" ? "desc" : "asc",
      }));
    }
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilterData({
      searchTerm: "",
      status: "all",
      verified: "all",
      district: "all",
      sortBy: "timestamp",
      sortOrder: "desc",
    });
    setCurrentPage(1);
    navigate("/donations", { replace: true });
  };

  // Toggle filter sections
  const toggleFilterSection = (section) => {
    setExpandedFilters(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Toggle all filters
  const toggleAllFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    return Object.values(filterData).filter(
      (val) => {
        if (typeof val === 'string') {
          return val && val !== "all" && val !== "" && 
                 !(val === "timestamp" && filterData.sortBy === "timestamp") &&
                 !(val === "desc" && filterData.sortOrder === "desc");
        }
        return false;
      }
    ).length;
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 1);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  // Get selected status label
  const getSelectedStatusLabel = () => {
    if (filterData.status === "all") return "Status";
    return statusOptions.find(opt => opt.value === filterData.status)?.label || "Status";
  };

  // Get selected verification label
  const getSelectedVerificationLabel = () => {
    if (filterData.verified === "all") return "Verification";
    return filterData.verified === "true" ? "Verified" : "Not Verified";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-gray-100/30">
      {/* Hero Section */}
      <div 
        className="relative overflow-hidden bg-cover bg-center text-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(5, 150, 105, 0.85), rgba(5, 150, 105, 0.9)), url("https://static.dw.com/image/39001885_605.jpg")',
        }}
      >
        <div className="relative px-4 py-8 md:py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs md:text-sm">
                <FaHeart className="h-3 w-3" />
                <span>Connecting Hearts, Saving Lives</span>
              </div>
              
              <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 px-2">
                Find & Support
                <span className="block text-emerald-100">Those in Need</span>
              </h1>
              
              <p className="text-sm md:text-lg text-emerald-100 mb-4 max-w-2xl mx-auto px-4">
                Browse verified donation requests across Sri Lanka.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-2 sm:px-4 max-w-7xl mx-auto -mt-4 md:-mt-6 relative z-10">
        {/* Search and Filter Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 md:p-6 mb-4 md:mb-6"
        >
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 text-sm md:text-base" />
              <input
                type="text"
                id="searchTerm"
                value={filterData.searchTerm}
                onChange={handleSearchChange}
                placeholder="Search requests..."
                className="w-full pl-9 md:pl-11 pr-8 md:pr-10 py-2.5 md:py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 text-sm md:text-base"
              />
              {filterData.searchTerm && (
                <button
                  onClick={() => handleFilterChange("searchTerm", "")}
                  className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <FaTimes className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 md:px-4 md:py-2.5 rounded-lg shadow-sm">
                <div className="text-xs font-medium">Total</div>
                <div className="text-base md:text-lg font-bold">{loading ? "..." : totalCount.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleAllFilters}
                className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm md:text-base"
              >
                <FaFilter className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{showFilters ? "Hide" : "Show"}</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-white text-gray-800 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mb-4 pb-4 border-b border-gray-200/50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <div className="flex flex-wrap gap-1.5">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`px-3 py-1.5 md:px-4 md:py-2.5 text-xs md:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 border ${
                      filterData.sortBy === option.value
                        ? `bg-emerald-50 text-emerald-700 border-emerald-200`
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <option.icon className={`w-3 h-3 md:w-4 md:h-4 ${
                      filterData.sortBy === option.value ? 'text-emerald-500' : 'text-gray-400'
                    }`} />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Professional Filter Grid */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  {/* Filter Grid Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-lg font-bold text-gray-900">Filters</h3>
                    <button
                      onClick={handleClearFilters}
                      className="text-xs md:text-sm text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1"
                    >
                      <FaTimes className="w-3 h-3" />
                      Reset
                    </button>
                  </div>

                  {/* Mobile-friendly Filter Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {/* District Filter */}
                    <div className="bg-gradient-to-br from-blue-50/50 to-white rounded-lg md:rounded-xl border border-gray-200 p-3 md:p-4">
                      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                        <div className="p-1.5 md:p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                          <FaMapMarkerAlt className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm md:text-base">District</h4>
                        </div>
                      </div>
                      <div className="relative">
                        <select
                          value={filterData.district}
                          onChange={(e) => handleFilterChange("district", e.target.value)}
                          className="w-full px-2 py-1.5 md:px-3 md:py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm md:text-base"
                        >
                          {districts.map((district) => (
                            <option key={district} value={district === "All Districts" ? "all" : district}>
                              {district}
                            </option>
                          ))}
                        </select>
                        <FaAngleDown className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div className="bg-gradient-to-br from-orange-50/50 to-white rounded-lg md:rounded-xl border border-gray-200 p-3 md:p-4">
                      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                        <div className="p-1.5 md:p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                          <FaClock className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm md:text-base">Status</h4>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <button
                          onClick={() => toggleFilterSection("status")}
                          className={`w-full px-2 py-1.5 md:px-3 md:py-2 text-left text-xs md:text-sm rounded-lg transition-all flex items-center justify-between border ${
                            filterData.status === "all"
                              ? "bg-gray-50 text-gray-800 border-gray-300"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <FaCircle className={`w-2 h-2 md:w-2 md:h-2 ${
                              filterData.status === "all" ? "text-gray-400" :
                              filterData.status === "Not yet received" ? "text-orange-500" :
                              filterData.status === "Linked a supplier" ? "text-blue-500" :
                              filterData.status === "Received" ? "text-green-500" :
                              filterData.status === "Already received" ? "text-lime-500" :
                              "text-red-500"
                            }`} />
                            <span>{getSelectedStatusLabel()}</span>
                          </div>
                          {expandedFilters.status ? (
                            <FaChevronDown className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400" />
                          ) : (
                            <FaChevronRight className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {expandedFilters.status && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-1.5 space-y-1">
                                {statusOptions.map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => handleFilterChange("status", option.value)}
                                    className={`w-full px-2 py-1.5 text-left text-xs md:text-sm rounded transition-all flex items-center gap-1.5 ${
                                      filterData.status === option.value
                                        ? `bg-${option.color}-50 text-${option.color}-700`
                                        : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <option.icon className={`w-2.5 h-2.5 md:w-3 md:h-3 ${
                                      filterData.status === option.value ? `text-${option.color}-500` : 'text-gray-400'
                                    }`} />
                                    <span>{option.label}</span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Verification Filter */}
                    <div className="bg-gradient-to-br from-emerald-50/50 to-white rounded-lg md:rounded-xl border border-gray-200 p-3 md:p-4">
                      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                        <div className="p-1.5 md:p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg">
                          <FaShieldAlt className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm md:text-base">Verification</h4>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <button
                          onClick={() => toggleFilterSection("verification")}
                          className={`w-full px-2 py-1.5 md:px-3 md:py-2 text-left text-xs md:text-sm rounded-lg transition-all flex items-center justify-between border ${
                            filterData.verified === "all"
                              ? "bg-gray-50 text-gray-800 border-gray-300"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <FaShieldAlt className={`w-2.5 h-2.5 md:w-3 md:h-3 ${
                              filterData.verified === "all" ? "text-gray-400" :
                              filterData.verified === "true" ? "text-emerald-500" :
                              "text-red-500"
                            }`} />
                            <span>{getSelectedVerificationLabel()}</span>
                          </div>
                          {expandedFilters.verification ? (
                            <FaChevronDown className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400" />
                          ) : (
                            <FaChevronRight className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {expandedFilters.verification && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-1.5 space-y-1">
                                {["all", "true", "false"].map((value) => (
                                  <button
                                    key={value}
                                    onClick={() => handleFilterChange("verified", value)}
                                    className={`w-full px-2 py-1.5 text-left text-xs md:text-sm rounded transition-all flex items-center gap-1.5 ${
                                      filterData.verified === value
                                        ? value === "true" ? "bg-emerald-50 text-emerald-700" :
                                          value === "false" ? "bg-red-50 text-red-700" :
                                          "bg-gray-50 text-gray-700"
                                        : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    {value === "all" ? (
                                      <FaGlobe className={`w-2.5 h-2.5 md:w-3 md:h-3 ${filterData.verified === value ? 'text-gray-500' : 'text-gray-400'}`} />
                                    ) : value === "true" ? (
                                      <FaShieldAlt className={`w-2.5 h-2.5 md:w-3 md:h-3 ${filterData.verified === value ? 'text-emerald-500' : 'text-gray-400'}`} />
                                    ) : (
                                      <FaExclamationTriangle className={`w-2.5 h-2.5 md:w-3 md:h-3 ${filterData.verified === value ? 'text-red-500' : 'text-gray-400'}`} />
                                    )}
                                    <span>
                                      {value === "all" ? "All Requests" :
                                       value === "true" ? "Verified Only" : "Not Verified"}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Section */}
        <div className="mb-6 md:mb-8">
          {/* Loading State */}
          {loading && donations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 md:py-16 bg-white/80 backdrop-blur-sm rounded-xl shadow border border-gray-200/50">
              <div className="animate-spin h-10 w-10 md:h-14 md:w-14 border-4 border-emerald-500 border-t-transparent rounded-full mb-3 md:mb-5"></div>
              <h3 className="text-base md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                Loading...
              </h3>
            </div>
          )}

          {/* Empty State */}
          {!loading && donations.length === 0 && (
            <div className="text-center py-12 md:py-16 bg-white/80 backdrop-blur-sm rounded-xl shadow border border-gray-200/50">
              <div className="text-gray-300 mb-4 md:mb-6">
                <FaExclamationTriangle className="w-16 h-16 md:w-20 md:h-20 mx-auto opacity-20" />
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
                No requests found
              </h3>
              <p className="text-gray-600 mb-6 md:mb-8 px-4 text-sm md:text-lg">
                {isAnyFilterActive()
                  ? "Try adjusting your filters"
                  : "Check back soon for new requests!"}
              </p>
              {isAnyFilterActive() && (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 md:gap-2 px-4 py-2.5 md:px-8 md:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg hover:from-emerald-600 hover:to-teal-700 text-sm md:text-base"
                >
                  <FaTimes className="w-4 h-4 md:w-5 md:h-5" />
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Donations Grid */}
          {!loading && donations.length > 0 && (
            <>
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-4 mb-4 md:mb-6">
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                    Donation Requests
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600">
                    Showing {donations.length} of {totalCount.toLocaleString()}
                  </p>
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              </div>

              {/* Responsive Grid - Mobile: 1 col, Tablet: 2 cols, Desktop: 3-4 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {donations.map((item) => (
                  <div key={item._id} className="h-full">
                    <DonationListing item={item} />
                  </div>
                ))}
              </div>

              {/* Mobile-friendly Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 md:mt-12 pt-4 md:pt-8 border-t border-gray-200/50">
                  <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
                    <div className="flex items-center gap-1 md:gap-2">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className={`px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                          currentPage === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        First
                      </button>
                      
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                          currentPage === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        ←
                      </button>
                      
                      <div className="flex items-center gap-1 mx-1 md:mx-4">
                        {generatePageNumbers().map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg transition-all text-xs md:text-sm font-medium ${
                              currentPage === page
                                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                          currentPage === totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        →
                      </button>
                      
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                          currentPage === totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        Last
                      </button>
                    </div>
                    
                    <p className="text-xs md:text-sm text-gray-500 text-center px-2">
                      Page {currentPage} of {totalPages} • {totalCount.toLocaleString()} total requests
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}