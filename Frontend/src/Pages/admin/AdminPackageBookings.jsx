import React, { useState, useEffect, useRef } from "react";
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
  FaArrowUp,
  FaArrowDown,
  FaWhatsapp,
  FaPhoneAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";

function DonationRequests() {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showFilters, setShowFilters] = useState(false);
const [filters, setFilters] = useState({
  district: "",
  status: "",
  priority: "",
  verified: "",
  callStatus: "all", 
});;
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const searchTimeoutRef = useRef(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  });

  // Form states for add/edit
  const [formData, setFormData] = useState({
    name: "",
    phone: [""],
    district: "",
    address: "",
    numberOfPeople: "",
    requirements: [],
    newRequirement: "",
    otherRequirements: "",
    time: "",
    priority: 3,
    verified: false,
    status: "Not yet received",
    callStatus: "",
    notes: "",
  });

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

  // Status options including "Complete"
  const statusOptions = [
    "Not yet received",
    "Linked a supplier",
    "Received",
    "Already received",
    "Complete",
    "FAKE",
  ];

  // Call Status options
// Call Status options
const callStatusOptions = [
  { value: "", label: "Not called" },
  { value: "Called - answered", label: "Called - answered" },
  { value: "Called - not answered", label: "Called - not answered" },
  { value: "all", label: "All Call Status" }, // Add an "all" option
];

  // Quick requirement suggestions
  const requirementSuggestions = [
    "Food (Cooked Meals)",
    "Dry Rations (Rice, Flour, Lentils)",
    "Drinking Water",
    "Essential Medicines",
    "First Aid Kits",
    "Blankets",
    "Clothes",
    "Sanitary Items",
    "Toiletries",
    "Baby Food",
    "Milk Powder",
    "Water Bottles",
    "Mosquito Nets",
    "Soap",
    "Toothpaste",
    "Shampoo",
    "Cooking Oil",
    "Sugar",
    "Salt",
    "Tea Leaves",
  ];

  // Fetch donations data
// Fetch donations data - FIXED VERSION
const fetchDonations = async (page = 1, search = "") => {
  try {
    setLoading(true);

    // Build query params
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "50",
      sortBy: sortConfig.key,
      sortOrder: sortConfig.direction,
    });

    if (search) {
      params.append("search", search);
    }

    // Add filters to query params - FIXED VERSION
    Object.entries(filters).forEach(([key, value]) => {
      // For callStatus, handle "all" case differently
      if (key === "callStatus") {
        if (value !== "all") {
          // Send even empty string "" for "not called"
          params.append(key, value);
          console.log(`Adding callStatus filter: ${key}=${value}`); // Debug log
        } else {
          console.log(`Skipping callStatus filter for "all" option`); // Debug log
        }
      } else {
        // For other filters, only add if not empty
        if (value !== "") {
          params.append(key, value);
          console.log(`Adding filter: ${key}=${value}`); // Debug log
        }
      }
    });

    console.log("API URL:", `/api/donation-requests?${params}`); // Debug log
    
    const response = await fetch(`/api/donation-requests?${params}`);

    if (!response.ok) {
      throw new Error("Failed to fetch donation requests");
    }

    const data = await response.json();
    if (data.success) {
      setDonations(data.data || []);
      setFilteredDonations(data.data || []);
      setPagination(
        data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 50,
        }
      );
      
      // Debug: Check if filtering is working
      console.log("Total donations fetched:", data.data?.length || 0);
      console.log("Pagination:", data.pagination);
      
      // Check how many have empty callStatus
      if (data.data) {
        const notCalledCount = data.data.filter(d => !d.callStatus || d.callStatus === "").length;
        const calledAnsweredCount = data.data.filter(d => d.callStatus === "Called - answered").length;
        const calledNotAnsweredCount = data.data.filter(d => d.callStatus === "Called - not answered").length;
        
        console.log("Call Status breakdown in fetched data:");
        console.log("- Not called:", notCalledCount);
        console.log("- Called - answered:", calledAnsweredCount);
        console.log("- Called - not answered:", calledNotAnsweredCount);
      }
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

  // Fetch ALL donations for export (without pagination)
  const fetchAllDonations = async () => {
    try {
      const params = new URLSearchParams({
        limit: "10000",
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      const response = await fetch(`/api/donation-requests?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch donations for export");
      }

      const data = await response.json();
      if (data.success) {
        return data.data || [];
      } else {
        throw new Error(data.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Fetch all donations error:", error);
      setErrorMessage("Failed to fetch data for export: " + error.message);
      return [];
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [sortConfig, filters]);

  // Apply frontend filtering for real-time search
  useEffect(() => {
    if (!searchKey.trim()) {
      setFilteredDonations(donations);
      return;
    }

    const filtered = donations.filter(donation => 
      donation.name?.toLowerCase().includes(searchKey.toLowerCase()) ||
      donation.phone?.some(phone => phone.includes(searchKey)) ||
      donation.district?.toLowerCase().includes(searchKey.toLowerCase()) ||
      donation.address?.toLowerCase().includes(searchKey.toLowerCase()) ||
      donation.status?.toLowerCase().includes(searchKey.toLowerCase()) ||
      formatCallStatus(donation.callStatus)?.toLowerCase().includes(searchKey.toLowerCase())
    );
    setFilteredDonations(filtered);
  }, [searchKey, donations]);

  // Handle real-time search
  const handleSearchChange = (value) => {
    setSearchKey(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      // Just trigger the useEffect above
    }, 300);
  };

  // Reset search to show all data
  const handleSearchReset = () => {
    setSearchKey("");
    setFilteredDonations(donations);
  };

  // Search function
  const handleSearch = () => {
    if (searchKey.trim()) {
      fetchDonations(1, searchKey);
    } else {
      handleSearchReset();
    }
  };

  // WhatsApp Sharing Function
  const shareToWhatsApp = (donation) => {
    try {
      let message = `📋 *DONATION REQUEST DETAILS*\n\n`;
      message += `*Name:* ${donation.name || "Not mentioned"}\n`;
      
      if (donation.phone && donation.phone.length > 0) {
        message += `*Contact Numbers:*\n`;
        donation.phone.forEach((phone, index) => {
          message += `${index + 1}. ${phone}\n`;
        });
      }
      
      message += `*District:* ${donation.district || "Not specified"}\n`;
      message += `*Address:* ${donation.address || "Not specified"}\n`;
      message += `*People Affected:* ${donation.numberOfPeople || "Not specified"}\n`;
      message += `*Urgency Level:* ${donation.priority || "3"}\n`;
      message += `*Status:* ${donation.status || "Not yet received"}\n`;
      
      message += `*Call Status:* ${formatCallStatus(donation.callStatus)}\n`;
      
      if (donation.verified) {
        message += `*✓ Verified Request*\n`;
      }
      
      if (donation.requirements && donation.requirements.length > 0) {
        message += `\n*Requirements:*\n`;
        donation.requirements.forEach((req, index) => {
          message += `• ${req}\n`;
        });
      }
      
      if (donation.otherRequirements && donation.otherRequirements.length > 0) {
        message += `\n*Other Requirements:*\n`;
        donation.otherRequirements.forEach((req, index) => {
          message += `• ${req}\n`;
        });
      }
      
      if (donation.notes) {
        message += `\n*Notes:* ${donation.notes}\n`;
      }
      
      message += `\n---\n*ID:* ${donation._id}\n`;
      message += `*Created:* ${formatDate(donation.createdAt)}\n`;
      
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      
      setSuccessMessage("Opening WhatsApp with donation details...");
    } catch (error) {
      console.error("WhatsApp sharing error:", error);
      setErrorMessage("Failed to open WhatsApp. Please try again.");
    }
  };

  // Export ALL data to Excel
  const exportToExcel = async () => {
    try {
      setLoading(true);
      setSuccessMessage("Fetching all data for export...");
      
      const allDonations = await fetchAllDonations();
      
      if (allDonations.length === 0) {
        setErrorMessage("No data available to export.");
        return;
      }
      
      const dataToExport = allDonations.map((donation, index) => ({
        "No": index + 1,
        "ID": donation._id || "",
        "Name": donation.name || "Not mentioned",
        "Phone": donation.phone?.join(", ") || "",
        "District": donation.district || "",
        "Address": donation.address || "",
        "People": donation.numberOfPeople || "Not specified",
        "Priority": donation.priority ? `Level ${donation.priority}` : "Level 3",
        "Status": donation.status || "",
        "Call Status": formatCallStatus(donation.callStatus) || "",
        "Verified": donation.verified ? "Yes" : "No",
        "Requirements": donation.requirements?.join(", ") || "",
        "Other Requirements": donation.otherRequirements?.join(", ") || "",
        "Time": donation.time || "",
        "Notes": donation.notes || "",
        "Created At": formatDate(donation.createdAt),
        "Updated At": formatDate(donation.updatedAt),
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "All Donation Requests");
      
      const columnWidths = [
        { wch: 8 },
        { wch: 24 },
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
        { wch: 30 },
        { wch: 15 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 10 },
        { wch: 40 },
        { wch: 30 },
        { wch: 15 },
        { wch: 50 },
        { wch: 20 },
        { wch: 20 },
      ];
      
      worksheet["!cols"] = columnWidths;
      
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F46E5" } },
        alignment: { horizontal: "center" }
      };
      
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = headerStyle;
      }
      
      const date = new Date();
      const formattedDate = date.toISOString().split('T')[0];
      const fileName = `donation_requests_all_${formattedDate}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
      
      setSuccessMessage(`Successfully exported ${allDonations.length} records to Excel!`);
    } catch (error) {
      console.error("Export error:", error);
      setErrorMessage("Failed to export data. Please try again.");
    } finally {
      setLoading(false);
    }
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

  // Handle phone number changes
  const handlePhoneChange = (index, value) => {
    const newPhoneNumbers = [...formData.phone];
    newPhoneNumbers[index] = value;
    setFormData({
      ...formData,
      phone: newPhoneNumbers,
    });
  };

  // Add new phone number field
  const handleAddPhoneField = () => {
    setFormData({
      ...formData,
      phone: [...formData.phone, ""],
    });
  };

  // Remove phone number field
  const handleRemovePhoneField = (index) => {
    const newPhoneNumbers = formData.phone.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      phone: newPhoneNumbers.length > 0 ? newPhoneNumbers : [""],
    });
  };

  // Add new requirement
  const handleAddRequirement = () => {
    if (formData.newRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, formData.newRequirement.trim()],
        newRequirement: "",
      });
    }
  };

  // Remove requirement
  const handleRemoveRequirement = (index) => {
    const newRequirements = [...formData.requirements];
    newRequirements.splice(index, 1);
    setFormData({
      ...formData,
      requirements: newRequirements,
    });
  };

  // Add requirement from suggestion
  const handleAddSuggestion = (suggestion) => {
    if (!formData.requirements.includes(suggestion)) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, suggestion],
      });
    }
  };

  // Handle Enter key press for requirements
  const handleRequirementKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddRequirement();
    }
  };

  // Clear all requirements
  const handleClearRequirements = () => {
    setFormData({
      ...formData,
      requirements: [],
    });
  };

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

const handleFilterChange = (name, value) => {
  console.log(`Filter changed: ${name}=${value}`);
  setFilters(prev => ({
    ...prev,
    [name]: value
  }));
};

const clearFilters = () => {
  console.log("Clearing all filters");
  setFilters({
    district: "",
    status: "",
    priority: "",
    verified: "",
    callStatus: "all", // Default to "all"
  });
};
  // Add new donation request
  const handleAddDonation = async () => {
    try {
      if (!formData.name.trim()) {
        setErrorMessage("Name is required");
        return;
      }

      const validPhoneNumbers = formData.phone.filter(phone => phone.trim());
      if (validPhoneNumbers.length === 0) {
        setErrorMessage("At least one phone number is required");
        return;
      }

      if (!formData.district || !formData.address.trim()) {
        setErrorMessage("District and address are required");
        return;
      }

      const requestData = {
        ...formData,
        phone: validPhoneNumbers,
        requirements: formData.requirements,
        otherRequirements: formData.otherRequirements ? [formData.otherRequirements] : [],
        notes: formData.notes || "",
      };

      delete requestData.newRequirement;

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

      const validPhoneNumbers = formData.phone.filter(phone => phone.trim());
      if (validPhoneNumbers.length === 0) {
        setErrorMessage("At least one phone number is required");
        return;
      }

      const requestData = {
        ...formData,
        phone: validPhoneNumbers,
        requirements: formData.requirements,
        otherRequirements: formData.otherRequirements ? [formData.otherRequirements] : [],
        notes: formData.notes || "",
      };

      delete requestData.newRequirement;

      const response = await fetch(
        `/api/donation-requests/${selectedDonation._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
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
      phone: [""],
      district: "",
      address: "",
      numberOfPeople: "",
      requirements: [],
      newRequirement: "",
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
      phone: donation.phone?.length > 0 ? donation.phone : [""],
      district: donation.district || "",
      address: donation.address || "",
      numberOfPeople: donation.numberOfPeople || "",
      requirements: donation.requirements || [],
      newRequirement: "",
      otherRequirements: donation.otherRequirements?.join(", ") || "",
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

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Received":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Already received":
        return "bg-teal-100 text-teal-800 border border-teal-200";
      case "Linked a supplier":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Complete":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "FAKE":
        return "bg-red-100 text-red-800 border border-red-200";
      case "Not yet received":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Get priority color
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

  // Get call status color and icon
  const getCallStatusColor = (callStatus) => {
    const status = formatCallStatus(callStatus);
    switch (status) {
      case "Called - answered":
        return {
          bgColor: "bg-green-100 text-green-800 border border-green-200",
          icon: <FaPhoneAlt className="h-3 w-3 mr-1" />,
        };
      case "Called - not answered":
        return {
          bgColor: "bg-red-100 text-red-800 border border-red-200",
          icon: <FaPhoneAlt className="h-3 w-3 mr-1" />,
        };
      case "Not called":
      default:
        return {
          bgColor: "bg-gray-100 text-gray-800 border border-gray-200",
          icon: <FaPhoneAlt className="h-3 w-3 mr-1" />,
        };
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

  // Format phone numbers for display
  const formatPhoneNumbers = (phoneArray) => {
    if (!phoneArray || phoneArray.length === 0) {
      return "No contact";
    }
    return phoneArray.join(", ");
  };

  // Format name
  const formatName = (name) => {
    if (!name) return "";
    const maxChars = 20;
    if (name.length > maxChars) {
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

  // Format call status for display
  const formatCallStatus = (callStatus) => {
    if (!callStatus || callStatus === "") return "Not called";
    return callStatus;
  };

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  if (loading && donations.length === 0) {
    return (
      <div className="p-4 md:p-6 pt-20 md:pt-24">
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {pagination.totalItems}
                </h2>
                <p className="text-gray-600 text-sm md:text-base">Total Requests</p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <FaChartBar className="text-lg md:text-2xl text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {donations.filter((d) => d.verified).length}
                </h2>
                <p className="text-gray-600 text-sm md:text-base">Verified</p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                <FaCheckCircle className="text-lg md:text-2xl text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {
                    donations.filter((d) => d.status === "Complete").length
                  }
                </h2>
                <p className="text-gray-600 text-sm md:text-base">Completed</p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <FaCheckCircle className="text-lg md:text-2xl text-white" />
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
                <p className="text-gray-600 text-sm md:text-base">High Priority</p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                <FaExclamationTriangle className="text-lg md:text-2xl text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-24 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm md:text-base"
                placeholder="Search by name, phone, district, address, status, call status..."
                value={searchKey}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyUp={(e) => e.key === "Enter" && handleSearch()}
              />
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                {searchKey && (
                  <button
                    onClick={handleSearchReset}
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded text-sm hover:from-blue-600 hover:to-cyan-600 transition-all"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Actions and Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  className="flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm md:text-base"
                  onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }}
                >
                  <FaPlus className="mr-2" />
                  <span className="hidden sm:inline">Add New Request</span>
                  <span className="sm:hidden">Add</span>
                </button>

                <button
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => setShowFilters(!showFilters)}
                  title="Filters"
                >
                  <FaFilter className="text-gray-600" />
                </button>

                <button
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={exportToExcel}
                  title="Download Excel (All Data)"
                >
                  <FaDownload className="text-gray-600" />
                </button>
              </div>

              {/* Filter Count */}
              {(filters.district || filters.status || filters.priority || filters.verified || filters.callStatus) && (
                <div className="text-sm text-gray-600">
                  {filteredDonations.length} of {donations.length} requests match filters
                  <button
                    onClick={clearFilters}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 pt-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District
                    </label>
                    <select
                      value={filters.district}
                      onChange={(e) => handleFilterChange('district', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                    >
                      <option value="">All Districts</option>
                      {districts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                    >
                      <option value="">All Status</option>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={filters.priority}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                    >
                      <option value="">All Priorities</option>
                      {[1, 2, 3, 4, 5].map((priority) => (
                        <option key={priority} value={priority}>
                          Level {priority}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Call Status
                    </label>
                    <select
  value={filters.callStatus}
  onChange={(e) => handleFilterChange('callStatus', e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
>
  <option value="all">All Call Status</option> {/* Add this first */}
  {callStatusOptions.map((status) => (
    status.value !== "all" && (
      <option key={status.value} value={status.value}>
        {status.label}
      </option>
    )
  ))}
</select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification
                    </label>
                    <select
                      value={filters.verified}
                      onChange={(e) => handleFilterChange('verified', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                    >
                      <option value="">All</option>
                      <option value="true">Verified Only</option>
                      <option value="false">Not Verified</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
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
          <div className="px-4 md:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-800">
                All Donation Requests
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({filteredDonations.length} requests on this page)
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
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th 
                    className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      {sortConfig.key === 'name' && (
                        sortConfig.direction === 'asc' ? 
                        <FaArrowUp className="ml-1" /> : 
                        <FaArrowDown className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    People
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Call Status
                  </th>
                  <th 
                    className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Created
                      {sortConfig.key === 'createdAt' && (
                        sortConfig.direction === 'asc' ? 
                        <FaArrowUp className="ml-1" /> : 
                        <FaArrowDown className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonations.map((donation, index) => {
                  const callStatusInfo = getCallStatusColor(donation.callStatus);
                  return (
                    <motion.tr
                      key={donation._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {(pagination.currentPage - 1) * pagination.itemsPerPage +
                          index +
                          1}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => shareToWhatsApp(donation)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                          title="Share via WhatsApp"
                        >
                          <FaWhatsapp className="h-5 w-5" />
                        </button>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {formatName(donation.name) || "Not mentioned"}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="space-y-1">
                          {donation.phone && donation.phone.map((phoneNumber, idx) => (
                            <div key={idx} className="flex items-center text-gray-600 text-sm">
                              <FaPhone className="h-3 w-3 mr-2 text-blue-500 flex-shrink-0" />
                              <span className="truncate max-w-xs">{phoneNumber}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {donation.district}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {donation.address}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaUsers className="h-3 w-3 mr-2 text-green-500" />
                          <span className="text-sm font-medium">
                            {donation.numberOfPeople || "Not specified"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            donation.priority
                          )}`}
                        >
                          Level {donation.priority}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
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
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${callStatusInfo.bgColor}`}>
                            <span className="flex items-center">
                              {callStatusInfo.icon}
                              {formatCallStatus(donation.callStatus)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(donation.createdAt)}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-1 md:space-x-2">
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
                  );
                })}
              </tbody>
            </table>

            {filteredDonations.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FaSearch className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No donation requests found
                </h3>
                <p className="text-gray-600">
                  {searchKey || Object.values(filters).some(v => v !== "") 
                    ? "Try adjusting your search or filters"
                    : "Add a new donation request to get started"}
                </p>
                {(searchKey || Object.values(filters).some(v => v !== "")) && (
                  <button
                    onClick={() => {
                      handleSearchReset();
                      clearFilters();
                    }}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
                  >
                    Reset Search & Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 md:px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                <div className="flex items-center justify-center md:justify-end space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      pagination.currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    Prev
                  </button>

                  {Array.from(
                    { length: Math.min(3, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 2) {
                        pageNum = i + 1;
                      } else if (
                        pagination.currentPage >=
                        pagination.totalPages - 1
                      ) {
                        pageNum = pagination.totalPages - 2 + i;
                      } else {
                        pageNum = pagination.currentPage - 1 + i;
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
                  </div>

                  {/* Phone Numbers */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      Contact Numbers *
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        (Add multiple numbers if needed)
                      </span>
                    </h4>
                    {formData.phone.map((phoneNumber, index) => (
                      <div key={index} className="flex gap-2 mb-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => handlePhoneChange(index, e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                            placeholder={`Phone number ${index + 1} (e.g., 0712345678)`}
                          />
                        </div>
                        {formData.phone.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePhoneField(index)}
                            className="px-4 py-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Remove phone number"
                          >
                            <FaTimes className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddPhoneField}
                      className="mt-2 px-4 py-2.5 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-lg border border-blue-200 hover:from-blue-200 hover:to-cyan-200 transition-all flex items-center"
                    >
                      <FaPlus className="mr-2 h-4 w-4" />
                      Add Another Phone Number
                    </button>
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
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        (Add requirements one by one)
                      </span>
                    </h4>
                    
                    {/* Input for new requirement */}
                    <div className="flex gap-2 mb-4">
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            type="text"
                            name="newRequirement"
                            value={formData.newRequirement}
                            onChange={(e) => setFormData({...formData, newRequirement: e.target.value})}
                            onKeyPress={handleRequirementKeyPress}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                            placeholder="Type a requirement (e.g., Food, Water, Medicine) and press Enter or click +"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddRequirement}
                        disabled={!formData.newRequirement.trim()}
                        className={`px-4 py-2.5 rounded-lg flex items-center justify-center transition-all ${
                          formData.newRequirement.trim()
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                        title="Add requirement"
                      >
                        <FaPlus className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Display added requirements */}
                    {formData.requirements.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Added Requirements ({formData.requirements.length})
                          </span>
                          {formData.requirements.length > 0 && (
                            <button
                              type="button"
                              onClick={handleClearRequirements}
                              className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {formData.requirements.map((requirement, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-lg border border-blue-200"
                            >
                              <span className="text-sm font-medium">{requirement}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveRequirement(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded-full transition-colors"
                                title="Remove"
                              >
                                <FaTimes className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <FaPlus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                          No requirements added yet. Type above and click + to add.
                        </p>
                      </div>
                    )}

                    {/* Quick Suggestions */}
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Quick add suggestions:</p>
                      <div className="flex flex-wrap gap-2">
                        {requirementSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleAddSuggestion(suggestion)}
                            disabled={formData.requirements.includes(suggestion)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              formData.requirements.includes(suggestion)
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-green-50 to-teal-50 text-green-700 border border-green-200 hover:from-green-100 hover:to-teal-100 hover:border-green-300"
                            }`}
                          >
                            {suggestion}
                            {formData.requirements.includes(suggestion) && (
                              <span className="ml-1 text-green-500">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Other Requirements */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      Other Requirements
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Requirements or Special Notes
                      </label>
                      <textarea
                        name="otherRequirements"
                        value={formData.otherRequirements}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        placeholder="Any other specific requirements or special notes"
                      />
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
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        placeholder="Additional notes, comments, etc."
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
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
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
                        />
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
                  </div>

                  {/* Phone Numbers */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      Contact Numbers *
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        (Add multiple numbers if needed)
                      </span>
                    </h4>
                    {formData.phone.map((phoneNumber, index) => (
                      <div key={index} className="flex gap-2 mb-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => handlePhoneChange(index, e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                            placeholder={`Phone number ${index + 1}`}
                          />
                        </div>
                        {formData.phone.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePhoneField(index)}
                            className="px-4 py-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Remove phone number"
                          >
                            <FaTimes className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddPhoneField}
                      className="mt-2 px-4 py-2.5 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-lg border border-blue-200 hover:from-blue-200 hover:to-cyan-200 transition-all flex items-center"
                    >
                      <FaPlus className="mr-2 h-4 w-4" />
                      Add Another Phone Number
                    </button>
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
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        (Add requirements one by one)
                      </span>
                    </h4>
                    
                    {/* Input for new requirement */}
                    <div className="flex gap-2 mb-4">
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            type="text"
                            name="newRequirement"
                            value={formData.newRequirement}
                            onChange={(e) => setFormData({...formData, newRequirement: e.target.value})}
                            onKeyPress={handleRequirementKeyPress}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                            placeholder="Type a requirement (e.g., Food, Water, Medicine) and press Enter or click +"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddRequirement}
                        disabled={!formData.newRequirement.trim()}
                        className={`px-4 py-2.5 rounded-lg flex items-center justify-center transition-all ${
                          formData.newRequirement.trim()
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                        title="Add requirement"
                      >
                        <FaPlus className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Display added requirements */}
                    {formData.requirements.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Added Requirements ({formData.requirements.length})
                          </span>
                          {formData.requirements.length > 0 && (
                            <button
                              type="button"
                              onClick={handleClearRequirements}
                              className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {formData.requirements.map((requirement, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-lg border border-blue-200"
                            >
                              <span className="text-sm font-medium">{requirement}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveRequirement(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded-full transition-colors"
                                title="Remove"
                              >
                                <FaTimes className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <FaPlus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                          No requirements added yet. Type above and click + to add.
                        </p>
                      </div>
                    )}

                    {/* Quick Suggestions */}
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Quick add suggestions:</p>
                      <div className="flex flex-wrap gap-2">
                        {requirementSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleAddSuggestion(suggestion)}
                            disabled={formData.requirements.includes(suggestion)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              formData.requirements.includes(suggestion)
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-green-50 to-teal-50 text-green-700 border border-green-200 hover:from-green-100 hover:to-teal-100 hover:border-green-300"
                            }`}
                          >
                            {suggestion}
                            {formData.requirements.includes(suggestion) && (
                              <span className="ml-1 text-green-500">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Other Requirements */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      Other Requirements
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Requirements or Special Notes
                      </label>
                      <textarea
                        name="otherRequirements"
                        value={formData.otherRequirements}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        placeholder="Any other specific requirements or special notes"
                      />
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
                        Notes
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
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
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
                      onClick={() => shareToWhatsApp(selectedDonation)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Share via WhatsApp"
                    >
                      <FaWhatsapp className="h-5 w-5" />
                    </button>
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
                          <div className="space-y-2">
                            {selectedDonation.phone?.map((phone, index) => (
                              <div key={index} className="flex items-center">
                                <FaPhone className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
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

                  {/* Other Requirements */}
                  {selectedDonation.otherRequirements &&
                    selectedDonation.otherRequirements.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-3">
                          Other Requirements
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedDonation.otherRequirements.map((req, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-teal-100 text-green-800 rounded-lg text-sm font-medium border border-green-200"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Call Status and Time Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <FaPhoneAlt className="mr-2 text-blue-500" />
                        Call Status
                      </h4>
                      <div className="flex items-center">
                        <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${getCallStatusColor(selectedDonation.callStatus).bgColor}`}>
                          <span className="flex items-center">
                            <FaPhoneAlt className="h-4 w-4 mr-2" />
                            {formatCallStatus(selectedDonation.callStatus)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedDonation.time && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <FaClock className="mr-2 text-purple-500" />
                          Time
                        </h4>
                        <div className="font-medium text-gray-900">
                          {selectedDonation.time}
                        </div>
                      </div>
                    )}
                  </div>

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