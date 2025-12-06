import {
  Search,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  UserCheck,
  Shield,
  Phone,
  Menu,
  X,
  Eye,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaUsers,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaUserShield,
  FaExclamationTriangle,
  FaDonate,
  FaMoneyBill,
  FaTruck,
  FaBox,
  FaTimes,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaInfoCircle,
  FaPlus as FaPlusIcon,
  FaLocationArrow,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

function DonarAdminpage() {
  const [donars, setDonars] = useState([]);
  const [filteredDonars, setFilteredDonars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEditDonationModal, setShowEditDonationModal] = useState(false);
  const [showDonarDetailsModal, setShowDonarDetailsModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [selectedDonar, setSelectedDonar] = useState(null);
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
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user) || {};

  // Aid categories matching backend data (same as in Listings component)
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
    "Colombo", "Kandy", "Gampaha", "Kalutara", "Galle", "Matara", 
    "Hambantota", "Jaffna", "Mannar", "Vavuniya", "Mullaitivu", 
    "Kilinochchi", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", 
    "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Monaragala", 
    "Ratnapura", "Kegalle", "Nuwara Eliya", "Matale"
  ];

  // Toast notification function
  const showToast = (message, type = "success") => {
    if (type === "success") {
      toast.success(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else if (type === "error") {
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else if (type === "warning") {
      toast.warning(message, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Fetch donars data
  const fetchDonars = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/donar/getAll");
      if (!response.ok) {
        throw new Error("Failed to fetch donars");
      }
      const data = await response.json();
      console.log("Donars data:", data);

      setDonars(data);
      setFilteredDonars(data);
      showToast(`Loaded ${data.length} donars`, "success");
    } catch (error) {
      console.error("Error fetching donars:", error);
      showToast("Failed to load donars", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonars();
  }, []);

  // Fetch donation request details by ID and open edit modal
  const fetchAndOpenEditDonation = async (donationId) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/donation-requests/${donationId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch donation details");
      }
      
      const data = await response.json();
      
      if (data.success) {
        const donation = data.data;
        setSelectedDonation(donation);
        
        // Populate form data for editing
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
        
        setShowEditDonationModal(true);
      } else {
        throw new Error(data.message || "Failed to fetch donation details");
      }
    } catch (error) {
      console.error("Error fetching donation details:", error);
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle click on donation ID - opens edit modal
  const handleDonationIdClick = (donationId) => {
    if (!donationId) {
      showToast("No donation ID found", "warning");
      return;
    }
    fetchAndOpenEditDonation(donationId);
  };

  // Handle click on view button for donor details
  const handleViewDonarClick = (donar) => {
    setSelectedDonar(donar);
    setShowDonarDetailsModal(true);
  };

  // Updated search function to handle donationType array
  const handleSearch = () => {
    if (!searchKey.trim()) {
      setFilteredDonars(donars);
      return;
    }

    const searchTerm = searchKey.toLowerCase().trim();
    const filtered = donars.filter((donar) => {
      // Search in donorName
      if (donar.donorName?.toLowerCase().includes(searchTerm)) return true;
      
      // Search in donorEmail
      if (donar.donorEmail?.toLowerCase().includes(searchTerm)) return true;
      
      // Search in donorPhone
      if (donar.donorPhone?.toLowerCase().includes(searchTerm)) return true;
      
      // Search in donationType array
      if (Array.isArray(donar.donationType)) {
        const matchesInDonationType = donar.donationType.some(type => 
          type.toLowerCase().includes(searchTerm)
        );
        if (matchesInDonationType) return true;
      } else if (donar.donationType?.toLowerCase().includes(searchTerm)) {
        // For backward compatibility if donationType is string
        return true;
      }
      
      // Search in estimatedValue
      if (donar.estimatedValue && 
          donar.estimatedValue.toString().includes(searchTerm)) return true;
      
      // Search in quantity
      if (donar.quantity && 
          donar.quantity.toString().toLowerCase().includes(searchTerm)) return true;
      
      return false;
    });

    setFilteredDonars(filtered);

    if (filtered.length === 0 && searchTerm) {
      showToast(`No donars found for "${searchTerm}"`, "warning");
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKey, donars]);

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

  // Edit donation request
  const handleEditDonation = async () => {
    try {
      if (!selectedDonation) return;

      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      // Validate required fields
      if (!formData.name.trim()) {
        setErrorMessage("Name is required");
        setIsSubmitting(false);
        return;
      }

      if (!formData.phone.trim()) {
        setErrorMessage("Phone number is required");
        setIsSubmitting(false);
        return;
      }

      if (!formData.district || !formData.address.trim()) {
        setErrorMessage("District and address are required");
        setIsSubmitting(false);
        return;
      }

      // Prepare data for backend
      const requestData = {
        ...formData,
        phone: [formData.phone], // Convert to array as expected by backend
        otherRequirements: formData.otherRequirements ? [formData.otherRequirements] : [],
        notes: formData.notes || "",
      };

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
        showToast("Donation request updated successfully!", "success");
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowEditDonationModal(false);
          resetForm();
        }, 2000);
      }
    } catch (error) {
      console.error("Edit donation error:", error);
      setErrorMessage(error.message);
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
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
    setSelectedDonation(null);
    setSuccessMessage("");
    setErrorMessage("");
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get donation type icon - updated to handle array
  const getDonationTypeIcon = (donationType) => {
    // If donationType is array, check first item
    const type = Array.isArray(donationType) 
      ? donationType[0]?.toLowerCase()
      : donationType?.toLowerCase();
    
    switch (type) {
      case "money":
      case "cash":
      case "financial":
        return <FaMoneyBill className="h-4 w-4 text-green-500" />;
      case "goods":
      case "items":
      case "materials":
        return <FaBox className="h-4 w-4 text-blue-500" />;
      case "food (cooked meals)":
      case "dry rations (rice, flour, lentils, etc.)":
        return <FaBox className="h-4 w-4 text-amber-500" />;
      case "drinking water":
        return <FaBox className="h-4 w-4 text-blue-300" />;
      case "essential medicines/first aid":
        return <FaBox className="h-4 w-4 text-red-500" />;
      case "blankets/clothes":
        return <FaBox className="h-4 w-4 text-purple-500" />;
      case "sanitary items/toiletries":
        return <FaBox className="h-4 w-4 text-pink-500" />;
      case "other":
        return <FaBox className="h-4 w-4 text-gray-500" />;
      default:
        return <FaDonate className="h-4 w-4 text-purple-500" />;
    }
  };

  // Get delivery method icon
  const getDeliveryMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "pickup":
        return <FaTruck className="h-4 w-4 text-orange-500" />;
      case "deliver":
        return <FaTruck className="h-4 w-4 text-green-500" />;
      default:
        return <FaTruck className="h-4 w-4 text-gray-500" />;
    }
  };

  // Check if donation includes specific type - for stats calculation
  const includesDonationType = (donar, typesToCheck) => {
    if (!donar.donationType) return false;
    
    if (Array.isArray(donar.donationType)) {
      return donar.donationType.some(type => 
        typesToCheck.some(check => type.toLowerCase().includes(check))
      );
    } else {
      return typesToCheck.some(check => 
        donar.donationType.toLowerCase().includes(check)
      );
    }
  };

  // Format donation types for display
  const formatDonationTypes = (donationType) => {
    if (!donationType) return "N/A";
    
    if (Array.isArray(donationType)) {
      if (donationType.length === 0) return "None";
      if (donationType.length === 1) return donationType[0];
      if (donationType.length === 2) return donationType.join(", ");
      return `${donationType.length} items`;
    }
    
    return donationType;
  };

  // Get status color for donation request
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

  // Stats Card Component
  const StatsCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <div className={`bg-white rounded-xl p-4 border-l-4 ${color} shadow-sm`}>
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color.replace("border", "bg").replace("-500", "-100")}`}>
          <Icon className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-3 md:p-4">
      <ToastContainer />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/20"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <div>
              <h1 className="text-lg font-semibold">Donor Management</h1>
              <p className="text-xs opacity-80">
                {donars.length} Total Donors
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with Sri Lanka Theme */}
      <div
        className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-xl mb-2 mt-16 md:mt-20"
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #065f46 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-52 bg-blue-300 rounded-full -translate-x-32 -translate-y-20"></div>
          <div className="absolute bottom-0 right-0 w-64 h-52 bg-green-300 rounded-full translate-x-32 translate-y-20"></div>
        </div>

        <div className="relative z-10 p-4 md:p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">
                Donor Management
              </h1>
              <p className="text-blue-100 text-sm md:text-lg">
                Managing donor contributions for Sri Lanka flood relief
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2 self-start md:self-auto">
              <FaUsers className="text-lg md:text-xl" />
              <span className="font-semibold text-sm md:text-base">
                {filteredDonars.length} Active Donors
              </span>
            </div>
          </div>

          {/* Breadcrumb */}
          <nav className="mt-4 md:mt-6">
            <ol className="flex flex-wrap items-center space-x-2 text-xs md:text-sm">
              <li className="flex items-center">
                <a href="/" className="hover:text-blue-200 flex items-center">
                  <FaHome className="mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Home</span>
                </a>
              </li>
              <li className="text-blue-300">/</li>
              <li className="text-gray-300">Dashboard</li>
              <li className="text-gray-300">/</li>
              <li className="font-semibold">Donor Management</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <StatsCard
          icon={FaUsers}
          title="Total Donors"
          value={filteredDonars.length}
          color="border-blue-500"
          subtitle="All donors"
        />
        <StatsCard
          icon={FaMoneyBill}
          title="Financial Donors"
          value={filteredDonars.filter(d => 
            includesDonationType(d, ["money", "cash", "financial"])
          ).length}
          color="border-green-500"
          subtitle="Monetary contributions"
        />
        <StatsCard
          icon={FaBox}
          title="Goods Donors"
          value={filteredDonars.filter(d => 
            includesDonationType(d, [
              "food", "rations", "water", "medicines", 
              "blankets", "clothes", "sanitary"
            ])
          ).length}
          color="border-purple-500"
          subtitle="Material contributions"
        />
        <StatsCard
          icon={FaCalendarAlt}
          title="This Month"
          value={
            filteredDonars.filter((d) => {
              const donateDate = new Date(d.createdAt);
              const now = new Date();
              return (
                donateDate.getMonth() === now.getMonth() &&
                donateDate.getFullYear() === now.getFullYear()
              );
            }).length
          }
          color="border-yellow-500"
          subtitle="New registrations"
        />
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="w-full">
            <div className="relative">
              <input
                type="text"
                className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Search by name, email, phone, or donation type..."
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
              />
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
              {searchKey && (
                <button
                  onClick={() => setSearchKey("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donors Table */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">
              Donors
            </h2>
            <div className="flex items-center space-x-3 md:space-x-4">
              <span className="text-xs md:text-sm text-gray-600">
                Showing {filteredDonars.length} of {donars.length}
              </span>
              <button
                onClick={fetchDonars}
                className="text-xs md:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">↻</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Donor ID
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Donation ID
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Donor Details
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Donation Details
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                  Donated Date
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 md:px-6 py-8 md:py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="mt-2 text-gray-600">Loading donors...</p>
                  </td>
                </tr>
              ) : filteredDonars.length > 0 ? (
                filteredDonars.map((donar, index) => (
                  <tr
                    key={donar._id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-3 md:px-6 py-4">
                      <div className="text-xs md:text-sm font-medium text-gray-900">
                        D{String(index + 1).padStart(3, "0")}
                      </div>
                      <div className="text-xs text-gray-500 hidden md:block">
                        ID: {donar._id?.slice(-6)}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4">
                      <button
                        onClick={() => handleDonationIdClick(donar.donationId)}
                        className="text-xs md:text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-all"
                        title="Click to edit donation request"
                        disabled={isSubmitting}
                      >
                        {donar.donationId?.slice(-8) || "N/A"}
                      </button>
                    </td>
                    <td className="px-3 md:px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">
                          {donar.donorName?.charAt(0).toUpperCase() || "D"}
                        </div>
                        <div className="ml-2 md:ml-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] md:max-w-none">
                            {donar.donorName}
                          </div>
                          <div className="text-xs md:text-sm text-gray-500 flex items-center mt-1">
                            <FaEnvelope className="h-3 w-3 mr-1 hidden sm:inline" />
                            <span className="truncate max-w-[140px] md:max-w-none">
                              {donar.donorEmail}
                            </span>
                          </div>
                          {donar.donorPhone ? (
                            <div className="text-xs md:text-sm text-gray-500 flex items-center mt-1">
                              <FaPhone className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">
                                {donar.donorPhone}
                              </span>
                              <span className="sm:hidden">
                                {donar.donorPhone.substring(0, 5)}...
                              </span>
                            </div>
                          ) : (
                            <div className="text-xs text-red-500 flex items-center mt-1">
                              <FaExclamationTriangle className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">No phone</span>
                            </div>
                          )}
                          <div className="text-xs md:text-sm text-gray-500 flex items-center mt-1">
                            <FaLocationArrow className="h-3 w-3 mr-1 hidden sm:inline" />
                            <span className="truncate max-w-[140px] md:max-w-none">
                              {donar.district || "N/A"},{donar.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          {getDonationTypeIcon(donar.donationType)}
                          <span className="ml-2 text-sm font-medium">
                            {formatDonationTypes(donar.donationType)}
                          </span>
                          {Array.isArray(donar.donationType) && donar.donationType.length > 1 && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              +{donar.donationType.length - 1}
                            </span>
                          )}
                        </div>
                        {donar.quantity && (
                          <div className="text-xs text-gray-600">
                            Quantity: {donar.quantity}
                          </div>
                        )}
                        {donar.estimatedValue && (
                          <div className="text-xs font-semibold text-green-600">
                            Value: {formatCurrency(donar.estimatedValue)}
                          </div>
                        )}
                        {donar.deliveryMethod && (
                          <div className="flex items-center text-xs text-gray-600">
                            {getDeliveryMethodIcon(donar.deliveryMethod)}
                            <span className="ml-1">{donar.deliveryMethod}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 text-sm text-gray-900 hidden lg:table-cell">
                      <div className="flex items-center">
                        <FaCalendarAlt className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(donar.createdAt)}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4">
                      <div className="flex space-x-1 md:space-x-2">
                        <button
                          onClick={() => handleViewDonarClick(donar)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1.5 md:px-3 md:py-2 rounded-lg transition-colors flex items-center"
                          title="View Donor Details"
                        >
                          <Eye className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="hidden md:inline ml-1">View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 md:px-6 py-8 md:py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-gray-100 flex items-center justify-center mb-3 md:mb-4">
                        <FaUsers className="h-8 w-8 md:h-12 md:w-12 text-gray-400" />
                      </div>
                      <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                        No donors found
                      </h3>
                      <p className="text-gray-500 text-sm md:text-base mb-3 md:mb-4">
                        {searchKey
                          ? "Try a different search term"
                          : "No donor records available"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Donation Modal (Replaces View Modal) */}
      <AnimatePresence>
        {showEditDonationModal && selectedDonation && (
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
                    <Edit className="mr-3 text-green-500" />
                    Edit Donation Request
                    <span className="ml-2 text-sm font-normal text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      ID: {selectedDonation._id?.slice(-8)}
                    </span>
                  </h3>
                  <button
                    onClick={() => {
                      setShowEditDonationModal(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={isSubmitting}
                  >
                    <FaTimes className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
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
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                            disabled={isSubmitting}
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
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
                        >
                          <option value="">Select Call Status</option>
                          <option value="Called - answered">Called - answered</option>
                          <option value="Called - not answered">Called - not answered</option>
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
                        disabled={isSubmitting}
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
                          disabled={isSubmitting}
                        >
                          <option value="Not yet received">Not yet received</option>
                          <option value="Linked a supplier">Linked a supplier</option>
                          <option value="Received">Received</option>
                          <option value="Already received">Already received</option>
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
                            disabled={isSubmitting}
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
                      setShowEditDonationModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEditDonation}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      "Update Request"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Donor Details Modal (View only) - Updated to show array donation types */}
      <AnimatePresence>
        {showDonarDetailsModal && selectedDonar && (
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
                    <FaUser className="mr-3 text-green-500" />
                    Donor Details
                  </h3>
                  <button
                    onClick={() => {
                      setShowDonarDetailsModal(false);
                      setSelectedDonar(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Donor Header */}
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 font-medium">Donor ID</div>
                        <div className="font-mono text-sm text-gray-800 truncate">
                          {selectedDonar._id}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium">Donation ID</div>
                        <div className="font-mono text-sm text-gray-800 truncate">
                          {selectedDonar.donationId || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Donor Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <FaUser className="mr-2 text-blue-500" />
                        Personal Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-600">Name</div>
                          <div className="font-medium text-gray-900">
                            {selectedDonar.donorName}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Email</div>
                          <div className="font-medium text-gray-900">
                            {selectedDonar.donorEmail}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Phone</div>
                          <div className="font-medium text-gray-900">
                            {selectedDonar.donorPhone || "Not provided"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <FaDonate className="mr-2 text-purple-500" />
                        Donation Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-600">Donation Type</div>
                          <div className="font-medium text-gray-900">
                            {Array.isArray(selectedDonar.donationType) ? (
                              <div className="space-y-1">
                                {selectedDonar.donationType.map((type, index) => (
                                  <div key={index} className="flex items-center">
                                    {getDonationTypeIcon([type])}
                                    <span className="ml-2">{type}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center">
                                {getDonationTypeIcon(selectedDonar.donationType)}
                                <span className="ml-2">{selectedDonar.donationType || "N/A"}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-600">Delivery Method</div>
                          <div className="font-medium text-gray-900 flex items-center">
                            {getDeliveryMethodIcon(selectedDonar.deliveryMethod)}
                            <span className="ml-2">{selectedDonar.deliveryMethod || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  {(selectedDonar.notes || selectedDonar.createdAt) && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Additional Information
                      </h4>
                      <div className="space-y-3">
                        {selectedDonar.notes && (
                          <div>
                            <div className="text-sm text-gray-600">Notes</div>
                            <div className="text-gray-700 whitespace-pre-wrap">
                              {selectedDonar.notes}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-gray-600">Donation Date</div>
                          <div className="font-medium text-gray-900 flex items-center">
                            <FaCalendarAlt className="h-4 w-4 mr-2 text-gray-400" />
                            {formatDate(selectedDonar.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDonarDetailsModal(false);
                      setSelectedDonar(null);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                  >
                    Close
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

export default DonarAdminpage;