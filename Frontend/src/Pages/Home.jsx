import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DonationListing from "../Components/Listings.jsx";
import { useSelector } from "react-redux";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaAngleDown,
  FaCheck,
  FaStar,
  FaCrown,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";

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
  const [featuredDonations, setFeaturedDonations] = useState([]);
  const [regularDonations, setRegularDonations] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;

  const [filterData, setFilterData] = useState({
    searchTerm: "",
    status: "all",
    verified: "all",
    district: "all",
    sortBy: "priority",
    sortOrder: "asc",
  });

  // Status options with colors
  const statusOptions = [
    { value: "all", label: "All Status", color: "gray" },
    { value: "Not yet received", label: "Not Yet Received", color: "orange" },
    { value: "Linked a supplier", label: "Linked Supplier", color: "blue" },
    { value: "Received", label: "Received", color: "green" },
    { value: "Already received", label: "Already Received", color: "lime" },
    { value: "FAKE", label: "Fake", color: "red" },
  ];

  // Verification options
  const verifiedOptions = [
    { value: "all", label: "All Verification" },
    { value: "true", label: "Verified Only" },
    { value: "false", label: "Not Verified" },
  ];

  // Sort options
  const sortOptions = [
    { value: "priority", label: "Priority" },
    { value: "timestamp", label: "Date Posted" },
    { value: "numberOfPeople", label: "People Count" },
  ];

  // Separate donations into featured (priority 1) and regular
  useEffect(() => {
    if (donations.length > 0) {
      const featured = donations.filter(
        (item) => item.priority === 1 || item.priority === "1"
      );
      const regular = donations.filter(
        (item) => item.priority !== 1 && item.priority !== "1"
      );
      setFeaturedDonations(featured);
      setRegularDonations(regular);
    } else {
      setFeaturedDonations([]);
      setRegularDonations([]);
    }
  }, [donations]);

  // Fetch donations whenever filterData or page changes
  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      setShowMore(false);

      try {
        const skip = (currentPage - 1) * itemsPerPage;
        const urlParams = new URLSearchParams(location.search);
        urlParams.set("skip", skip.toString());
        urlParams.set("limit", itemsPerPage.toString());
        urlParams.set("searchTerm", filterData.searchTerm || "");
        urlParams.set("status", filterData.status || "all");
        urlParams.set("verified", filterData.verified || "all");
        urlParams.set("district", filterData.district || "all");
        urlParams.set("sortBy", filterData.sortBy || "priority");
        urlParams.set("sortOrder", filterData.sortOrder || "asc");

        const res = await fetch(
          `/api/donation-requests/getdonationlistings?${urlParams.toString()}`
        );

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const result = await res.json();

        if (result.success) {
          // Sort donations based on sort settings
          const sortedDonations = (result.data || []).sort((a, b) => {
            // Always show priority 1 first
            if (a.priority == 1 && b.priority != 1) return -1;
            if (a.priority != 1 && b.priority == 1) return 1;

            // Then apply other sorting
            const sortBy = filterData.sortBy;
            const sortOrder = filterData.sortOrder === "asc" ? 1 : -1;

            if (sortBy === "priority") {
              const priorityA = parseInt(a.priority) || 999;
              const priorityB = parseInt(b.priority) || 999;
              return (priorityA - priorityB) * sortOrder;
            } else if (sortBy === "timestamp") {
              const timeA = new Date(a.timestamp || 0).getTime();
              const timeB = new Date(b.timestamp || 0).getTime();
              return (timeA - timeB) * sortOrder;
            } else if (sortBy === "numberOfPeople") {
              const peopleA = parseInt(a.numberOfPeople) || 0;
              const peopleB = parseInt(b.numberOfPeople) || 0;
              return (peopleA - peopleB) * sortOrder;
            }
            return 0;
          });

          setDonations(sortedDonations);
          setTotalCount(result.total || sortedDonations.length);
          setTotalPages(Math.ceil((result.total || 0) / itemsPerPage));
          setShowMore(result.hasMore);
        }

        // Update URL with current filters
        const currentParams = new URLSearchParams(location.search);
        if (currentParams.toString() !== urlParams.toString()) {
          navigate(`/donations?${urlParams.toString()}`, { replace: true });
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
    const sortBy = urlParams.get("sortBy") || "priority";
    const sortOrder = urlParams.get("sortOrder") || "asc";
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
        sortOrder: "asc",
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
      sortBy: "priority",
      sortOrder: "asc",
    });
    setCurrentPage(1);
    navigate("/donations", { replace: true });
  };

  // Clear specific filter
  const clearFilter = (type) => {
    setFilterData((prev) => ({ ...prev, [type]: "all" }));
    setCurrentPage(1);
  };

  // Load more donations
  const onShowMoreClick = async () => {
    const startIndex = donations.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("skip", startIndex.toString());

    try {
      const res = await fetch(
        `/api/donation-requests/getdonationlistings?${urlParams.toString()}`
      );
      const result = await res.json();

      if (result.success) {
        const newDonations = result.data || [];
        const sortedNewDonations = newDonations.sort((a, b) => {
          if (a.priority == 1 && b.priority != 1) return -1;
          if (a.priority != 1 && b.priority == 1) return 1;
          const priorityA = parseInt(a.priority) || 999;
          const priorityB = parseInt(b.priority) || 999;
          return priorityA - priorityB;
        });
        setDonations((prev) => [...prev, ...sortedNewDonations]);
        setShowMore(result.hasMore);
      }
    } catch (error) {
      console.error("Error loading more:", error);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("page", page.toString());
    navigate(`/donations?${urlParams.toString()}`, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Check if any filter is active
  const isAnyFilterActive = () => {
    return (
      filterData.searchTerm ||
      filterData.status !== "all" ||
      filterData.verified !== "all" ||
      filterData.district !== "all"
    );
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    return Object.values(filterData).filter(
      (val) => val && val !== "all" && val !== false && val !== "priority"
    ).length;
  };

  // Get color for status/priority badges
  const getColorClass = (type, value) => {
    const colors = {
      status: {
        "Not yet received": "bg-orange-100 text-orange-800 border-orange-200",
        "Linked a supplier": "bg-blue-100 text-blue-800 border-blue-200",
        Received: "bg-green-100 text-green-800 border-green-200",
        "Already received": "bg-lime-100 text-lime-800 border-lime-200",
        FAKE: "bg-red-100 text-red-800 border-red-200",
      },
      priority: {
        "1": "bg-red-100 text-red-800 border-red-200",
        1: "bg-red-100 text-red-800 border-red-200",
        "2": "bg-orange-100 text-orange-800 border-orange-200",
        2: "bg-orange-100 text-orange-800 border-orange-200",
        "3": "bg-yellow-100 text-yellow-800 border-yellow-200",
        3: "bg-yellow-100 text-yellow-800 border-yellow-200",
        "4": "bg-blue-100 text-blue-800 border-blue-200",
        4: "bg-blue-100 text-blue-800 border-blue-200",
        "5": "bg-green-100 text-green-800 border-green-200",
        5: "bg-green-100 text-green-800 border-green-200",
      },
      verified: {
        true: "bg-green-100 text-green-800 border-green-200",
        false: "bg-red-100 text-red-800 border-red-200",
      },
    };
    return colors[type]?.[value] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Donation Requests
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Browse and support donation requests from those in need across Sri Lanka. 
            Your help can make a difference.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6 group">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              id="searchTerm"
              value={filterData.searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by name, phone, location, requirements..."
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300 text-lg shadow-sm"
            />
            {filterData.searchTerm && (
              <button
                onClick={() => handleFilterChange("searchTerm", "")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filters Section */}
          <div className="space-y-6">
            {/* Filters Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <FaFilter className="w-5 h-5" />
                  <span className="font-semibold">Filters</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="bg-white text-blue-600 text-sm rounded-full h-6 w-6 flex items-center justify-center font-bold">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>

                {isAnyFilterActive() && (
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300 border border-gray-200"
                  >
                    <FaTimes className="w-4 h-4" />
                    <span className="font-medium">Clear All</span>
                  </button>
                )}
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Sort by:</span>
                <div className="flex gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${
                        filterData.sortBy === option.value
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option.label}
                      {filterData.sortBy === option.value && (
                        filterData.sortOrder === "asc" ? 
                        <FaSortAmountDown className="w-3 h-3" /> : 
                        <FaSortAmountUp className="w-3 h-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-sm font-medium">
                {loading ? (
                  <span className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    Loading...
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-3 items-center">
                    {featuredDonations.length > 0 && (
                      <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                        ⚠️ {featuredDonations.length} URGENT
                      </span>
                    )}
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                      {totalCount} {totalCount === 1 ? "request" : "requests"} found
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {isAnyFilterActive() && (
              <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
                {filterData.searchTerm && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">
                    Search: "{filterData.searchTerm}"
                    <button
                      onClick={() => handleFilterChange("searchTerm", "")}
                      className="ml-1 hover:text-blue-900 transition-colors p-1 rounded-full hover:bg-blue-200"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterData.status !== "all" && (
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border ${getColorClass(
                      "status",
                      filterData.status
                    )}`}
                  >
                    Status:{" "}
                    {
                      statusOptions.find((s) => s.value === filterData.status)
                        ?.label
                    }
                    <button
                      onClick={() => clearFilter("status")}
                      className="ml-1 hover:opacity-80 transition-opacity p-1 rounded-full"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterData.verified !== "all" && (
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border ${getColorClass(
                      "verified",
                      filterData.verified
                    )}`}
                  >
                    {filterData.verified === "true"
                      ? "Verified Only"
                      : "Not Verified"}
                    <button
                      onClick={() => clearFilter("verified")}
                      className="ml-1 hover:opacity-80 transition-opacity p-1 rounded-full"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterData.district !== "all" && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-200">
                    <FaMapMarkerAlt className="w-3 h-3" />
                    {filterData.district}
                    <button
                      onClick={() => clearFilter("district")}
                      className="ml-1 hover:text-purple-900 transition-colors p-1 rounded-full hover:bg-purple-200"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* Status Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaCheck className="text-blue-500" />
                    Status Filter
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange("status", option.value)
                        }
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 border shadow-sm ${
                          filterData.status === option.value
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-md transform scale-105"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verification Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaStar className="text-yellow-500" />
                    Verification Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {verifiedOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange("verified", option.value)
                        }
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 border shadow-sm ${
                          filterData.verified === option.value
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-md transform scale-105"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* District Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-500" />
                    District Filter
                  </label>
                  <select
                    value={filterData.district}
                    onChange={(e) => handleFilterChange("district", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-900 transition-all duration-300"
                  >
                    {districts.map((district) => (
                      <option key={district} value={district === "All Districts" ? "all" : district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="mb-8">
          {/* Loading State */}
          {loading && donations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mb-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                </div>
              </div>
              <p className="text-gray-600 text-lg font-medium mt-4">
                Loading donation requests...
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Please wait while we fetch the latest requests
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && donations.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-xl border border-gray-200">
              <div className="text-gray-300 mb-6">
                <FaExclamationTriangle className="w-24 h-24 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No donation requests found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg">
                {isAnyFilterActive()
                  ? "Try adjusting your filters to see more results"
                  : "There are currently no donation requests available. Check back soon!"}
              </p>
              {isAnyFilterActive() && (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <FaTimes className="w-5 h-5" />
                  Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Donations Grid */}
          {!loading && donations.length > 0 && (
            <>
              {/* Featured Section - Priority 1 */}
              {featuredDonations.length > 0 && (
                <div className="mb-12">
                  {/* Featured Header */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-r-xl p-6 mb-8 shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
                        <FaCrown className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                          ⚠️ URGENT REQUESTS NEED IMMEDIATE ATTENTION
                        </h2>
                        <p className="text-red-600 font-medium mt-2">
                          <FaExclamationTriangle className="inline-block w-5 h-5 mr-2" />
                          These are Priority 1 requests requiring immediate assistance
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg animate-pulse">
                        {featuredDonations.length} URGENT
                      </div>
                    </div>
                  </div>

                  {/* Featured Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {featuredDonations.map((item) => (
                      <div key={item._id} className="relative group">
                        {/* Featured Badge */}
                        <div className="absolute -top-3 -right-3 z-10">
                          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-2xl animate-bounce">
                            <FaStar className="w-4 h-4" />
                            URGENT
                          </div>
                        </div>
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="relative transform transition-transform duration-300 group-hover:-translate-y-2">
                          <DonationListing item={item} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Requests Section */}
              {regularDonations.length > 0 && (
                <div>
                  {/* Regular Header */}
                  {featuredDonations.length > 0 && (
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-l-4 border-blue-500 rounded-r-xl p-6 mb-8 shadow-lg">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                          <FaCheck className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-900">
                            ALL DONATION REQUESTS
                          </h2>
                          <p className="text-gray-600 mt-2">
                            Browse through all donation requests sorted by priority
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200">
                          Showing {regularDonations.length} requests
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Regular Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {regularDonations.map((item) => (
                      <div key={item._id} className="transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <DonationListing item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center justify-center mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    {currentPage > 1 && (
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Previous
                      </button>
                    )}
                    
                    <div className="flex items-center gap-1">
                      {generatePageNumbers().map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 ${
                            currentPage === page
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    {currentPage < totalPages && (
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Next
                      </button>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages} • Showing {itemsPerPage} requests per page
                  </p>
                </div>
              )}

              {/* Alternative: Load More Button */}
              {showMore && totalPages <= 1 && (
                <div className="flex justify-center mt-12 pt-8 border-t border-gray-200">
                  <button
                    onClick={onShowMoreClick}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <span>Load More Requests</span>
                    <FaAngleDown className="w-5 h-5 animate-bounce" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}