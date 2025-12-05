import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaPlus,
  FaPhone,
  FaMapMarkerAlt,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaEdit,
  FaTrash,
  FaEye,
  FaHome,
  FaTimes,
  FaChartBar,
  FaFilter,
  FaDownload,
  FaSort,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function DonationRequests() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  // Form states for add/edit
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    district: "",
    address: "",
    numberOfPeople: "",
    requirements: [],
    otherRequirements: "",
    time: "",
    priority: 3,
    verified: false,
    status: "Not yet received",
    callStatus: "",
    notes: "",
  });

  // Aid categories matching backend data
  const aidCategories = [
    { value: "Food (Cooked Meals)", label: "Food (Cooked Meals)" },
    {
      value: "Dry Rations (Rice, Flour, Lentils, etc.)",
      label: "Dry Rations (Rice, Flour, Lentils, etc.)",
    },
    { value: "Drinking Water", label: "Drinking Water" },
    {
      value: "Essential Medicines/First Aid",
      label: "Essential Medicines/First Aid",
    },
    { value: "Blankets/Clothes", label: "Blankets/Clothes" },
    { value: "Sanitary Items/Toiletries", label: "Sanitary Items/Toiletries" },
    { value: "Other", label: "Other" },
  ];

  // Districts of Sri Lanka
  const districts = [
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

  // Fetch donations data
  const fetchDonations = async (page = 1, search = "") => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/donation-requests?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch donation requests");
      }

      const data = await response.json();
      if (data.success) {
        setDonations(data.data || []);
        setPagination(
          data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 20,
          }
        );
      } else {
        throw new Error(data.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Search function
  const handleSearch = () => {
    fetchDonations(1, searchKey);
  };

  // Update form data
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle requirements selection
  const handleRequirementToggle = (requirement) => {
    const newRequirements = formData.requirements.includes(requirement)
      ? formData.requirements.filter((r) => r !== requirement)
      : [...formData.requirements, requirement];

    setFormData({
      ...formData,
      requirements: newRequirements,
    });
  };

  // Add new donation request
  const handleAddDonation = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setErrorMessage("Name is required");
        return;
      }

      if (!formData.phone.trim()) {
        setErrorMessage("Phone number is required");
        return;
      }

      if (!formData.district || !formData.address.trim()) {
        setErrorMessage("District and address are required");
        return;
      }

      // Prepare data for backend
      const requestData = {
        ...formData,
        phone: formData.phone,
        requirements: formData.requirements,
        otherRequirements: formData.otherRequirements || "",
        notes: formData.notes || "",
      };

      const response = await fetch("/api/donation-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create donation request");
      }

      if (data.success) {
        setSuccessMessage("Donation request created successfully!");
        setShowAddModal(false);
        resetForm();
        fetchDonations();
      }
    } catch (error) {
      console.error("Add donation error:", error);
      setErrorMessage(error.message);
    }
  };

  // Edit donation request
  const handleEditDonation = async () => {
    try {
      if (!selectedDonation) return;

      const response = await fetch(
        `/api/donation-requests/${selectedDonation._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update donation request");
      }

      if (data.success) {
        setSuccessMessage("Donation request updated successfully!");
        setShowEditModal(false);
        resetForm();
        fetchDonations();
      }
    } catch (error) {
      console.error("Edit donation error:", error);
      setErrorMessage(error.message);
    }
  };

  // Delete donation request
  const handleDeleteDonation = async () => {
    try {
      if (!selectedDonation) return;

      const response = await fetch(
        `/api/donation-requests/${selectedDonation._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete donation request");
      }

      if (data.success) {
        setSuccessMessage("Donation request deleted successfully!");
        setShowDeleteModal(false);
        fetchDonations();
      }
    } catch (error) {
      console.error("Delete donation error:", error);
      setErrorMessage(error.message);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      district: "",
      address: "",
      numberOfPeople: "",
      requirements: [],
      otherRequirements: "",
      time: "",
      priority: 3,
      verified: false,
      status: "Not yet received",
      callStatus: "",
      notes: "",
    });
  };

  // Open edit modal with donation data
  const openEditModal = (donation) => {
    setSelectedDonation(donation);
    setFormData({
      name: donation.name || "",
      phone: donation.phone?.[0] || "",
      district: donation.district || "",
      address: donation.address || "",
      numberOfPeople: donation.numberOfPeople || "",
      requirements: donation.requirements || [],
      otherRequirements: donation.otherRequirements?.[0] || "",
      time: donation.time || "",
      priority: donation.priority || 3,
      verified: donation.verified || false,
      status: donation.status || "Not yet received",
      callStatus: donation.callStatus || "",
      notes: donation.notes || "",
    });
    setShowEditModal(true);
    setShowViewModal(false);
  };

  // Open view modal
  const openViewModal = (donation) => {
    setSelectedDonation(donation);
    setShowViewModal(true);
  };

  // Get status color (matching AdminDashboard theme)
  const getStatusColor = (status) => {
    switch (status) {
      case "Received":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Already received":
        return "bg-teal-100 text-teal-800 border border-teal-200";
      case "Linked a supplier":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "FAKE":
        return "bg-red-100 text-red-800 border border-red-200";
      case "Not yet received":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Get priority color (matching AdminDashboard theme)
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1:
        return "bg-red-100 text-red-800 border border-red-200";
      case 2:
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case 3:
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case 4:
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case 5:
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchDonations(page, searchKey);
    }
  };
  // Helper function to break name after certain character length
  const formatName = (name) => {
    if (!name) return "";

    const maxChars = 20; // Adjust this value as needed

    if (name.length > maxChars) {
      // Find a good breaking point (space near the maxChars)
      const breakIndex = name.lastIndexOf(" ", maxChars);

      if (breakIndex > 0) {
        return (
          <>
            {name.substring(0, breakIndex)}
            <br />
            {name.substring(breakIndex + 1)}
          </>
        );
      }
    }

    return name;
  };

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  if (loading) {
    return (
      <div className="p-6 pt-24">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white rounded-xl shadow-sm"></div>
            ))}
          </div>
          <div className="h-96 bg-white rounded-xl shadow-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="p-4 md:p-6 pt-20 md:pt-24">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Donation Requests Management
              </h1>
              <p className="text-gray-600">
                Manage and track all donation requests across Sri Lanka
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <FaHome className="text-blue-500" />
              <span className="text-gray-500">/</span>
              <span className="text-gray-800 font-medium">
                Donation Requests
              </span>
            </div>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {pagination.totalItems}
                </h2>
                <p className="text-gray-600">Total Requests</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <FaChartBar className="text-2xl text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {donations.filter((d) => d.verified).length}
                </h2>
                <p className="text-gray-600">Verified</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                <FaCheckCircle className="text-2xl text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {
                    donations.filter((d) => d.status === "Not yet received")
                      .length
                  }
                </h2>
                <p className="text-gray-600">Pending</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                <FaClock className="text-2xl text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {
                    donations.filter(
                      (d) => d.priority === 1 || d.priority === 2
                    ).length
                  }
                </h2>
                <p className="text-gray-600">High Priority</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                <FaExclamationTriangle className="text-2xl text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  placeholder="Search by name, phone, address, or district..."
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  onKeyUp={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-md text-sm hover:from-blue-600 hover:to-cyan-600 transition-all"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
              >
                <FaPlus className="mr-2" />
                Add New Request
              </button>

              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <FaFilter className="text-gray-600" />
              </button>

              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <FaDownload className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-3 text-xl" />
                <span className="text-green-800 font-medium">
                  {successMessage}
                </span>
              </div>
              <button
                onClick={() => setSuccessMessage("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-500 mr-3 text-xl" />
                <span className="text-red-800 font-medium">{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Donations Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                All Donation Requests
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({pagination.totalItems} requests)
                </span>
              </h3>
              <div className="text-sm text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    People
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.map((donation, index) => (
                  <motion.tr
                    key={donation._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(pagination.currentPage - 1) * pagination.itemsPerPage +
                        index +
                        1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {formatName(donation.name) || "Not mentioned"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {donation.phone && donation.phone.length > 0 && (
                        <div className="flex items-center text-gray-600">
                          <FaPhone className="h-3 w-3 mr-2 text-blue-500" />
                          <span className="font-medium">
                            {donation.phone[0]}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {donation.district}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {donation.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUsers className="h-3 w-3 mr-2 text-green-500" />
                        <span className="text-sm font-medium">
                          {donation.numberOfPeople || "Not specified"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          donation.priority
                        )}`}
                      >
                        Level {donation.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            donation.status
                          )}`}
                        >
                          {donation.status}
                        </span>
                        {donation.verified && (
                          <span className="text-xs text-green-600 flex items-center">
                            <FaCheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(donation.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openViewModal(donation)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(donation)}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDonation(donation);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {donations.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FaSearch className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No donation requests found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or add a new donation request
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                  to{" "}
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}{" "}
                  of {pagination.totalItems} requests
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      pagination.currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (
                        pagination.currentPage >=
                        pagination.totalPages - 2
                      ) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                            pagination.currentPage === pageNum
                              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      pagination.currentPage === pagination.totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Donation Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaPlus className="mr-3 text-blue-500" />
                    Add New Donation Request
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                          placeholder="Enter contact person name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                          placeholder="0712345678"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      Location Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          District *
                        </label>
                        <select
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        >
                          <option value="">Select District</option>
                          {districts.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Urgency Level
                        </label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        >
                          <option value="1">1 - Critical (Highest)</option>
                          <option value="2">2 - Very High</option>
                          <option value="3">3 - High</option>
                          <option value="4">4 - Medium</option>
                          <option value="5">5 - Low</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        placeholder="Enter full address"
                      />
                    </div>
                  </div>

                  {/* People Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      People Information
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of People
                      </label>
                      <input
                        type="text"
                        name="numberOfPeople"
                        value={formData.numberOfPeople}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        placeholder="e.g., 50 families, around 200 people"
                      />
                    </div>
                  </div>

                  {/* Aid Requirements */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      Aid Requirements
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {aidCategories.map((category) => (
                        <label
                          key={category.value}
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.requirements.includes(
                              category.value
                            )}
                            onChange={() =>
                              handleRequirementToggle(category.value)
                            }
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">
                            {category.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      Additional Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time (Optional)
                        </label>
                        <input
                          type="text"
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                          placeholder="e.g., 09:30:00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Call Status
                        </label>
                        <select
                          name="callStatus"
                          value={formData.callStatus}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        >
                          <option value="">Select Call Status</option>
                          <option value="Called - answered">
                            Called - answered
                          </option>
                          <option value="Called - not answered">
                            Called - not answered
                          </option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other Requirements / Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        placeholder="Additional notes, specific requirements, etc."
                      />
                    </div>
                  </div>

                  {/* Status and Verification */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      Status and Verification
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        >
                          <option value="Not yet received">
                            Not yet received
                          </option>
                          <option value="Linked a supplier">
                            Linked a supplier
                          </option>
                          <option value="Received">Received</option>
                          <option value="Already received">
                            Already received
                          </option>
                          <option value="FAKE">FAKE</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            name="verified"
                            checked={formData.verified}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">
                            Verified Request
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddDonation}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                  >
                    Create Request
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Donation Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaEdit className="mr-3 text-green-500" />
                    Edit Donation Request
                  </h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Same form structure as Add Modal */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Continue with same form structure as Add Modal... */}
                  {/* For brevity, I'm showing the structure but you should copy the complete form from Add Modal */}

                  {/* Location Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      Location Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          District *
                        </label>
                        <select
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        >
                          <option value="">Select District</option>
                          {districts.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Urgency Level
                        </label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        >
                          <option value="1">1 - Critical (Highest)</option>
                          <option value="2">2 - Very High</option>
                          <option value="3">3 - High</option>
                          <option value="4">4 - Medium</option>
                          <option value="5">5 - Low</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* People Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      People Information
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of People
                      </label>
                      <input
                        type="text"
                        name="numberOfPeople"
                        value={formData.numberOfPeople}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Aid Requirements */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      Aid Requirements
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {aidCategories.map((category) => (
                        <label
                          key={category.value}
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.requirements.includes(
                              category.value
                            )}
                            onChange={() =>
                              handleRequirementToggle(category.value)
                            }
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">
                            {category.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      Additional Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time (Optional)
                        </label>
                        <input
                          type="text"
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Call Status
                        </label>
                        <select
                          name="callStatus"
                          value={formData.callStatus}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        >
                          <option value="">Select Call Status</option>
                          <option value="Called - answered">
                            Called - answered
                          </option>
                          <option value="Called - not answered">
                            Called - not answered
                          </option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other Requirements / Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Status and Verification */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      Status and Verification
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        >
                          <option value="Not yet received">
                            Not yet received
                          </option>
                          <option value="Linked a supplier">
                            Linked a supplier
                          </option>
                          <option value="Received">Received</option>
                          <option value="Already received">
                            Already received
                          </option>
                          <option value="FAKE">FAKE</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            name="verified"
                            checked={formData.verified}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">
                            Verified Request
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEditDonation}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                  >
                    Update Request
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {showViewModal && selectedDonation && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaEye className="mr-3 text-blue-500" />
                    Donation Request Details
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(selectedDonation)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FaEdit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimes className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Request Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 font-medium">
                          ID
                        </div>
                        <div className="font-mono text-sm text-gray-800 truncate">
                          {selectedDonation._id}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium">
                          Status
                        </div>
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            selectedDonation.status
                          )}`}
                        >
                          {selectedDonation.status}
                        </div>
                        {selectedDonation.verified && (
                          <div className="text-xs text-green-600 mt-1 flex items-center">
                            <FaCheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium">
                          Urgency
                        </div>
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                            selectedDonation.priority
                          )}`}
                        >
                          Level {selectedDonation.priority}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium">
                          Created
                        </div>
                        <div>{formatDate(selectedDonation.createdAt)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <FaUsers className="mr-2 text-green-500" />
                        Contact Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-600">Name</div>
                          <div className="font-medium text-gray-900">
                            {selectedDonation.name || "Not mentioned"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">
                            Phone Numbers
                          </div>
                          <div className="space-y-1">
                            {selectedDonation.phone?.map((phone, index) => (
                              <div key={index} className="flex items-center">
                                <FaPhone className="h-4 w-4 mr-2 text-blue-500" />
                                <span className="font-medium text-gray-900">
                                  {phone}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-red-500" />
                        Location
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-600">District</div>
                          <div className="font-medium text-gray-900">
                            {selectedDonation.district}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Address</div>
                          <div className="font-medium text-gray-900">
                            {selectedDonation.address}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* People Information */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      People Information
                    </h4>
                    <div className="flex items-center">
                      <FaUsers className="h-5 w-5 mr-3 text-green-500" />
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedDonation.numberOfPeople || "Not specified"}
                      </div>
                    </div>
                  </div>

                  {/* Aid Requirements */}
                  {selectedDonation.requirements &&
                    selectedDonation.requirements.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-3">
                          Aid Requirements
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedDonation.requirements.map((req, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-lg text-sm font-medium border border-blue-200"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Other Information */}
                  {(selectedDonation.time || selectedDonation.callStatus) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedDonation.time && (
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <div className="text-sm text-gray-600">Time</div>
                          <div className="font-medium text-gray-900">
                            {selectedDonation.time}
                          </div>
                        </div>
                      )}
                      {selectedDonation.callStatus && (
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <div className="text-sm text-gray-600">
                            Call Status
                          </div>
                          <div className="font-medium text-gray-900">
                            {selectedDonation.callStatus}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedDonation.notes && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Notes
                      </h4>
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {selectedDonation.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedDonation && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Confirm Deletion
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this donation request? This
                    action cannot be undone.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="text-sm font-medium text-gray-900">
                      {selectedDonation.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedDonation.district}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {selectedDonation._id}
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteDonation}
                    className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DonationRequests;
