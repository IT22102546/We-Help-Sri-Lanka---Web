import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Phone,
  MapPin,
  Users,
  AlertCircle,
  Check,
  X,
  Edit,
  Trash2,
  Eye,
  Globe,
} from "lucide-react";
import { FaHome } from "react-icons/fa";

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
  };

  // Open view modal
  const openViewModal = (donation) => {
    setSelectedDonation(donation);
    setShowViewModal(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Not yet received":
        return "bg-yellow-100 text-yellow-800";
      case "Linked a supplier":
        return "bg-blue-100 text-blue-800";
      case "Received":
        return "bg-green-100 text-green-800";
      case "Already received":
        return "bg-teal-100 text-teal-800";
      case "FAKE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get urgency color
  const getUrgencyColor = (level) => {
    switch (level) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-blue-100 text-blue-800";
      case 3:
        return "bg-yellow-100 text-yellow-800";
      case 4:
        return "bg-orange-100 text-orange-800";
      case 5:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      {/* Breadcrumb Card */}
      <div className="card bg-white shadow-sm rounded-lg mb-6">
        <div className="card-body p-4">
          <div className="flex justify-between items-center">
            <div className="">
              <h5 className="text-xl font-semibold mb-3">Donation Requests</h5>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb flex items-center space-x-3 text-sm text-gray-600">
                  <li className="breadcrumb-item flex items-center">
                    <a
                      href="/"
                      className="hover:text-blue-600 flex items-center"
                    >
                      <FaHome className="mr-2 text-lg" />
                      Home
                    </a>
                  </li>
                  <li className="breadcrumb-item">
                    <a href="#" className="hover:text-blue-600">
                      / Donation Requests
                    </a>
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Success and Error Messages */}
      {successMessage && (
        <div className="alert alert-success mb-4">
          <div className="flex-1">
            <Check className="h-6 w-6 mr-2" />
            <label className="text-sm">{successMessage}</label>
          </div>
          <button
            onClick={() => setSuccessMessage("")}
            className="btn btn-sm btn-ghost"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-error mb-4">
          <div className="flex-1">
            <AlertCircle className="h-6 w-6 mr-2" />
            <label className="text-sm">{errorMessage}</label>
          </div>
          <button
            onClick={() => setErrorMessage("")}
            className="btn btn-sm btn-ghost"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Row */}
      <div className="flex justify-center mb-4">
        <div className="relative w-full max-w-lg">
          <input
            type="text"
            className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by name, phone, address, or district..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Request
        </button>
      </div>

      {/* Donations Table */}
      <div className="card mx-5">
        <div className="card-header p-4">
          <h4>All Donation Requests ({pagination.totalItems})</h4>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <div className="overflow-x-auto bg-white shadow rounded-lg">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      People
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Requirements
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Urgency
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-200">
                  {donations.map((donation, index) => (
                    <tr key={donation._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {donation.name || "Not mentioned"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {donation.phone && donation.phone.length > 0 && (
                          <div className="text-gray-600">
                            {donation.phone[0]}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{donation.district}</div>
                        <div className="text-gray-600 text-sm mt-1 truncate max-w-xs">
                          {donation.address}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          {donation.numberOfPeople || "Not specified"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {donation.requirements &&
                            donation.requirements.slice(0, 2).map((req, i) => (
                              <span
                                key={i}
                                className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded mr-1"
                              >
                                {req}
                              </span>
                            ))}
                          {donation.requirements &&
                            donation.requirements.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{donation.requirements.length - 2} more
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                            donation.priority
                          )}`}
                        >
                          Level {donation.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              donation.status
                            )}`}
                          >
                            {donation.status}
                          </span>
                          {donation.verified && (
                            <span className="text-xs text-green-600 flex items-center">
                              <Check className="h-3 w-3 mr-1" /> Verified
                            </span>
                          )}
                          {donation.callStatus && (
                            <span className="text-xs text-gray-500">
                              {donation.callStatus}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(donation.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openViewModal(donation)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(donation)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDonation(donation);
                              setShowDeleteModal(true);
                            }}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {donations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No donation requests found
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 py-4 border-t">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1 rounded ${
                  pagination.currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
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
                      className={`px-3 py-1 rounded ${
                        pagination.currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-300 hover:bg-gray-50"
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
                className={`px-3 py-1 rounded ${
                  pagination.currentPage === pagination.totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Next
              </button>

              <span className="text-sm text-gray-600 ml-4">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Add Donation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      <Plus className="h-6 w-6 inline mr-2" />
                      Add New Donation Request
                    </h3>

                    <div className="space-y-4">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter contact person name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0712345678"
                          />
                        </div>
                      </div>

                      {/* Location Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            District *
                          </label>
                          <select
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Urgency Level
                          </label>
                          <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="1">1 - Low</option>
                            <option value="2">2 - Medium Low</option>
                            <option value="3">3 - Medium</option>
                            <option value="4">4 - High</option>
                            <option value="5">5 - Critical</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address *
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter full address"
                        />
                      </div>

                      {/* People Count */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of People
                        </label>
                        <input
                          type="text"
                          name="numberOfPeople"
                          value={formData.numberOfPeople}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 50 families, around 200 people"
                        />
                      </div>

                      {/* Aid Requirements */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Aid Requirements
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {aidCategories.map((category) => (
                            <label
                              key={category.value}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={formData.requirements.includes(
                                  category.value
                                )}
                                onChange={() =>
                                  handleRequirementToggle(category.value)
                                }
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700">
                                {category.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Other Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time (Optional)
                          </label>
                          <input
                            type="text"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 09:30:00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Call Status
                          </label>
                          <select
                            name="callStatus"
                            value={formData.callStatus}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Other Requirements / Notes
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Additional notes, specific requirements, etc."
                        />
                      </div>

                      {/* Status and Verification */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              name="verified"
                              checked={formData.verified}
                              onChange={handleInputChange}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700">
                              Verified Request
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddDonation}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Create Request
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Donation Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      <Edit className="h-6 w-6 inline mr-2" />
                      Edit Donation Request
                    </h3>

                    <div className="space-y-4">
                      {/* Same form as Add Modal */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            District *
                          </label>
                          <select
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Urgency Level
                          </label>
                          <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="1">1 - Low</option>
                            <option value="2">2 - Medium Low</option>
                            <option value="3">3 - Medium</option>
                            <option value="4">4 - High</option>
                            <option value="5">5 - Critical</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address *
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of People
                        </label>
                        <input
                          type="text"
                          name="numberOfPeople"
                          value={formData.numberOfPeople}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Aid Requirements
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {aidCategories.map((category) => (
                            <label
                              key={category.value}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={formData.requirements.includes(
                                  category.value
                                )}
                                onChange={() =>
                                  handleRequirementToggle(category.value)
                                }
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700">
                                {category.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time
                          </label>
                          <input
                            type="text"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Call Status
                          </label>
                          <select
                            name="callStatus"
                            value={formData.callStatus}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              name="verified"
                              checked={formData.verified}
                              onChange={handleInputChange}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700">
                              Verified Request
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleEditDonation}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Update Request
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedDonation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        <Eye className="h-6 w-6 inline mr-2" />
                        Donation Request Details
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setShowViewModal(false);
                            openEditModal(selectedDonation);
                          }}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setShowViewModal(false)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Request Header */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-600">ID</div>
                            <div className="font-mono text-sm">
                              {selectedDonation._id}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Status</div>
                            <div
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                selectedDonation.status
                              )}`}
                            >
                              {selectedDonation.status}
                            </div>
                            {selectedDonation.verified && (
                              <div className="text-xs text-green-600 mt-1">
                                ✓ Verified
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Urgency</div>
                            <div
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(
                                selectedDonation.priority
                              )}`}
                            >
                              Level {selectedDonation.priority}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Created</div>
                            <div>{formatDate(selectedDonation.createdAt)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Contact Information
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <div className="text-sm text-gray-600">Name</div>
                              <div className="font-medium">
                                {selectedDonation.name || "Not mentioned"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">
                                Phone Numbers
                              </div>
                              <div className="space-y-1">
                                {selectedDonation.phone?.map((phone, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center"
                                  >
                                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                    <span className="font-medium">{phone}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Location
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <div className="text-sm text-gray-600">
                                District
                              </div>
                              <div className="font-medium">
                                {selectedDonation.district}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">
                                Address
                              </div>
                              <div className="font-medium">
                                {selectedDonation.address}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* People Information */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          People Information
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="font-medium">
                            {selectedDonation.numberOfPeople || "Not specified"}
                          </div>
                        </div>
                      </div>

                      {/* Aid Requirements */}
                      {selectedDonation.requirements &&
                        selectedDonation.requirements.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Aid Requirements
                            </h4>
                            <div className="space-y-2">
                              {selectedDonation.requirements.map(
                                (req, index) => (
                                  <div
                                    key={index}
                                    className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r"
                                  >
                                    <div className="font-medium">{req}</div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Other Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedDonation.time && (
                          <div>
                            <div className="text-sm text-gray-600">Time</div>
                            <div>{selectedDonation.time}</div>
                          </div>
                        )}
                        {selectedDonation.callStatus && (
                          <div>
                            <div className="text-sm text-gray-600">
                              Call Status
                            </div>
                            <div>{selectedDonation.callStatus}</div>
                          </div>
                        )}
                      </div>

                      {selectedDonation.notes && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Notes
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="italic">
                              {selectedDonation.notes}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDonation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-red-600">
                      Warning!
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this donation request?
                        <br />
                        <b>Name:</b> {selectedDonation.name}
                        <br />
                        <b>District:</b> {selectedDonation.district}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteDonation}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonationRequests;
