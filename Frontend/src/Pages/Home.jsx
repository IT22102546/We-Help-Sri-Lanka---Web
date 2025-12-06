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
} from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);
  const [donations, setDonations] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const [filterData, setFilterData] = useState({
    searchTerm: "",
    status: "all",
    priority: "all",
    verified: "all",
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

  // Priority options with colors
  const priorityOptions = [
    { value: "all", label: "All Priority", color: "gray" },
    { value: "1", label: "Priority 1", color: "red" },
    { value: "2", label: "Priority 2", color: "orange" },
    { value: "3", label: "Priority 3", color: "yellow" },
    { value: "4", label: "Priority 4", color: "blue" },
    { value: "5", label: "Priority 5", color: "green" },
  ];

  // Verification options
  const verifiedOptions = [
    { value: "all", label: "All Verification" },
    { value: "true", label: "Verified Only" },
    { value: "false", label: "Not Verified" },
  ];

  // Fetch donations whenever filterData changes
  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      setShowMore(false);

      try {
        const urlParams = new URLSearchParams(location.search);
        urlParams.set("skip", "0");
        urlParams.set("limit", "20");
        urlParams.set("district", "all");
        urlParams.set("searchTerm", filterData.searchTerm || "");
        urlParams.set("status", filterData.status || "all");
        urlParams.set("priority", filterData.priority || "all");
        urlParams.set("verified", filterData.verified || "all");

        const res = await fetch(
          `/api/donation-requests/getdonationlistings?${urlParams.toString()}`
        );

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const result = await res.json();

        if (result.success) {
          setDonations(result.data || []);
          setShowMore(result.hasMore);
        }

        const currentParams = new URLSearchParams(location.search);
        if (currentParams.toString() !== urlParams.toString()) {
          navigate(`/donations?${urlParams.toString()}`, { replace: true });
        }
      } catch (error) {
        console.error("Error fetching donations:", error);
        setDonations([]);
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
  }, [filterData, navigate, location.search]);

  // Parse URL parameters on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTerm = urlParams.get("searchTerm") || "";
    const status = urlParams.get("status") || "all";
    const priority = urlParams.get("priority") || "all";
    const verified = urlParams.get("verified") || "all";

    setFilterData({
      searchTerm,
      status,
      priority,
      verified,
    });
  }, [location.search]);

  // Handle search input changes
  const handleSearchChange = (e) => {
    setFilterData((prev) => ({ ...prev, searchTerm: e.target.value }));
  };

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    setFilterData((prev) => ({ ...prev, [type]: value }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilterData({
      searchTerm: "",
      status: "all",
      priority: "all",
      verified: "all",
    });
    navigate("/donations", { replace: true });
  };

  // Clear specific filter
  const clearFilter = (type) => {
    setFilterData((prev) => ({ ...prev, [type]: "all" }));
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
        setDonations((prev) => [...prev, ...(result.data || [])]);
        setShowMore(result.hasMore);
      }
    } catch (error) {
      console.error("Error loading more:", error);
    }
  };

  // Check if any filter is active
  const isAnyFilterActive = () => {
    return (
      filterData.searchTerm ||
      filterData.status !== "all" ||
      filterData.priority !== "all" ||
      filterData.verified !== "all"
    );
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    return Object.values(filterData).filter(
      (val) => val && val !== "all" && val !== false
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
        1: "bg-red-100 text-red-800 border-red-200",
        2: "bg-orange-100 text-orange-800 border-orange-200",
        3: "bg-yellow-100 text-yellow-800 border-yellow-200",
        4: "bg-blue-100 text-blue-800 border-blue-200",
        5: "bg-green-100 text-green-800 border-green-200",
      },
      verified: {
        true: "bg-green-100 text-green-800 border-green-200",
        false: "bg-red-100 text-red-800 border-red-200",
      },
    };
    return colors[type]?.[value] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Donation Requests
          </h1>
          <p className="text-gray-600 mt-2">
            Browse and filter donation requests from those in need
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              id="searchTerm"
              value={filterData.searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by name, phone, location, or requirements..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-200"
            />
          </div>

          {/* Filters Section */}
          <div className="space-y-6">
            {/* Filters Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-300 border border-blue-100 shadow-sm"
                >
                  <FaFilter className="w-4 h-4" />
                  <span className="font-medium">Filters</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>

                {isAnyFilterActive() && (
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-300 shadow-sm"
                  >
                    <FaTimes className="w-3 h-3" />
                    Clear All
                  </button>
                )}
              </div>

              <div className="text-sm text-gray-600 font-medium">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    Loading...
                  </span>
                ) : (
                  `${donations.length} ${
                    donations.length === 1 ? "request" : "requests"
                  } found`
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {isAnyFilterActive() && (
              <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
                {filterData.searchTerm && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
                    Search: "{filterData.searchTerm}"
                    <button
                      onClick={() => handleFilterChange("searchTerm", "")}
                      className="ml-1 hover:text-blue-900 transition-colors"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterData.status !== "all" && (
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${getColorClass(
                      "status",
                      filterData.status
                    )} shadow-sm`}
                  >
                    Status:{" "}
                    {
                      statusOptions.find((s) => s.value === filterData.status)
                        ?.label
                    }
                    <button
                      onClick={() => clearFilter("status")}
                      className="ml-1 hover:opacity-80 transition-opacity"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterData.priority !== "all" && (
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${getColorClass(
                      "priority",
                      filterData.priority
                    )} shadow-sm`}
                  >
                    Priority {filterData.priority}
                    <button
                      onClick={() => clearFilter("priority")}
                      className="ml-1 hover:opacity-80 transition-opacity"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterData.verified !== "all" && (
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${getColorClass(
                      "verified",
                      filterData.verified
                    )} shadow-sm`}
                  >
                    {filterData.verified === "true"
                      ? "Verified"
                      : "Not Verified"}
                    <button
                      onClick={() => clearFilter("verified")}
                      className="ml-1 hover:opacity-80 transition-opacity"
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
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange("status", option.value)
                        }
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 border ${
                          filterData.status === option.value
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Priority Level
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {priorityOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange("priority", option.value)
                        }
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 border ${
                          filterData.priority === option.value
                            ? `bg-${option.color}-600 text-white border-${option.color}-600 shadow-md`
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verification Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Verification Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {verifiedOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange("verified", option.value)
                        }
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 border ${
                          filterData.verified === option.value
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="mb-8">
          {/* Loading State */}
          {loading && donations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600">Loading donation requests...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && donations.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-20 h-20 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No donation requests found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {isAnyFilterActive()
                  ? "Try adjusting your filters to see more results"
                  : "There are currently no donation requests available. Check back soon!"}
              </p>
              {isAnyFilterActive() && (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <FaTimes className="w-4 h-4" />
                  Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Donations Grid */}
          {!loading && donations.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {donations.map((item) => (
                  <DonationListing key={item._id} item={item} />
                ))}
              </div>

              {/* Load More Button */}
              {showMore && (
                <div className="flex justify-center mt-12 pt-8 border-t border-gray-200">
                  <button
                    onClick={onShowMoreClick}
                    className="inline-flex items-center gap-3 px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-300 hover:border-gray-400 hover:shadow-sm"
                  >
                    <span>Load More Requests</span>
                    <FaAngleDown className="w-4 h-4" />
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
