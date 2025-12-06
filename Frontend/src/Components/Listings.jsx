import { useState } from "react";
import { Link } from "react-router-dom";
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
  MdEmail,
  MdAttachMoney,
  MdComment,
  MdPublic,
} from "react-icons/md";
import {
  FaExclamationTriangle,
  FaTruckLoading,
  FaUserCheck,
  FaClock,
  FaUtensils,
  FaFirstAid,
  FaWater,
  FaBaby,
  FaFemale,
  FaMale,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { GiFamilyHouse } from "react-icons/gi";
import { BsChatTextFill } from "react-icons/bs";

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

// Categories for multi-select
const Categories = [
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

export default function Listings({ item }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [donationForm, setDonationForm] = useState({
    donationId: item._id,
    donorName: "",
    donorPhone: "",
    donorEmail: "",
    donationType: [],
    deliveryMethod: "deliver",
    notes: "",
    location: "",
    district: "",
  });

  // Get priority configuration
  const getPriorityConfig = () => {
    switch (item.priority) {
      case 1:
        return {
          color: "bg-gradient-to-r from-red-500 to-red-600",
          border: "border-red-100",
          icon: <FaExclamationTriangle className="text-white" />,
          text: "Critical",
          badge: "text-xs px-3 py-1.5",
        };
      case 2:
        return {
          color: "bg-gradient-to-r from-orange-500 to-orange-500",
          border: "border-orange-100",
          icon: <FaExclamationTriangle className="text-white" />,
          text: "High Priority",
          badge: "text-xs px-3 py-1.5",
        };
      case 3:
        return {
          color: "bg-gradient-to-r from-blue-500 to-blue-600",
          border: "border-blue-100",
          icon: <FaClock className="text-white" />,
          text: "Medium Priority",
          badge: "text-xs px-3 py-1.5",
        };
      case 4:
        return {
          color: "bg-gradient-to-r from-green-500 to-green-600",
          border: "border-green-100",
          icon: <FaClock className="text-white" />,
          text: "Low Priority",
          badge: "text-xs px-3 py-1.5",
        };
      default:
        return {
          color: "bg-gradient-to-r from-gray-500 to-gray-600",
          border: "border-gray-100",
          icon: <MdInfo className="text-white" />,
          text: "Normal",
          badge: "text-xs px-3 py-1.5",
        };
    }
  };

  // Get status configuration
  const getStatusConfig = () => {
    const status = item.status?.toLowerCase() || "pending";
    switch (status) {
      case "received":
      case "already received":
        return {
          color: "bg-emerald-50 border-emerald-200 text-emerald-700",
          icon: <MdCheckCircle className="text-emerald-600" />,
        };
      case "linked a supplier":
        return {
          color: "bg-blue-50 border-blue-200 text-blue-700",
          icon: <FaTruckLoading className="text-blue-600" />,
        };
      case "fake":
        return {
          color: "bg-red-50 border-red-200 text-red-700",
          icon: <FaExclamationTriangle className="text-red-600" />,
        };
      default:
        return {
          color: "bg-amber-50 border-amber-200 text-amber-700",
          icon: <FaClock className="text-amber-600" />,
        };
    }
  };

  // Get requirement icons
  const getRequirementIcon = (req) => {
    const reqLower = req.toLowerCase();
    if (reqLower.includes("food") || reqLower.includes("meal"))
      return <FaUtensils className="text-amber-600" />;
    if (reqLower.includes("water"))
      return <FaWater className="text-blue-500" />;
    if (reqLower.includes("medical") || reqLower.includes("medicine"))
      return <FaFirstAid className="text-red-500" />;
    if (reqLower.includes("baby") || reqLower.includes("infant"))
      return <FaBaby className="text-pink-500" />;
    if (reqLower.includes("women"))
      return <FaFemale className="text-purple-500" />;
    if (reqLower.includes("men")) return <FaMale className="text-blue-500" />;
    if (reqLower.includes("shelter"))
      return <GiFamilyHouse className="text-green-600" />;
    return <MdLocalGroceryStore className="text-gray-500" />;
  };

  const priorityConfig = getPriorityConfig();
  const statusConfig = getStatusConfig();

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Handle category selection for multi-select
  const handleCategoryToggle = (categoryValue) => {
    setDonationForm((prev) => {
      const currentTypes = [...prev.donationType];
      const index = currentTypes.indexOf(categoryValue);

      if (index > -1) {
        // Remove if already selected
        currentTypes.splice(index, 1);
      } else {
        // Add if not selected
        currentTypes.push(categoryValue);
      }

      return {
        ...prev,
        donationType: currentTypes,
      };
    });
  };

  // Handle donation form submission
  const handleDonationSubmit = async (e) => {
    e.preventDefault();

    // Validation - at least one donation type must be selected
    if (donationForm.donationType.length === 0) {
      alert("Please select at least one donation type");
      return;
    }

    // Validation - location fields are required
    if (!donationForm.district || !donationForm.location) {
      alert("Please provide both district and specific location");
      return;
    }

    try {
      // Prepare the donation data matching backend schema
      const donationData = {
        donationId: donationForm.donationId || item._id,
        donorName: donationForm.donorName,
        donorPhone: donationForm.donorPhone,
        donorEmail: donationForm.donorEmail,
        donationType: donationForm.donationType,
        deliveryMethod: donationForm.deliveryMethod,
        district: donationForm.district,
        location: donationForm.location,
        notes: donationForm.notes,
      };

      // Send to API
      const response = await fetch("/api/donar/adddonar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donationData),
      });

      if (response.ok) {
        alert("Donation submitted successfully!");
        setIsDonateModalOpen(false);
        // Reset form
        setDonationForm({
          donationId: item._id,
          donorName: "",
          donorPhone: "",
          donorEmail: "",
          donationType: [],
          deliveryMethod: "deliver",
          notes: "",
          location: "",
          district: "",
        });
      } else {
        alert("Failed to submit donation. Please try again.");
      }
    } catch (error) {
      console.error("Donation submission error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDonationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset donation form when modal opens/closes
  const handleDonateModalToggle = (isOpen) => {
    setIsDonateModalOpen(isOpen);
    if (!isOpen) {
      // Reset form when closing
      setDonationForm({
        donationId: item._id,
        donorName: "",
        donorPhone: "",
        donorEmail: "",
        donationType: [],
        deliveryMethod: "deliver",
        notes: "",
        location: "",
        district: "",
      });
    }
  };

  return (
    <>
      {/* Enhanced Card View */}
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 border border-gray-100 group">
        {/* Priority Badge */}
        <div
          className={`${priorityConfig.color} ${priorityConfig.badge} rounded-lg flex items-center justify-center gap-1 text-white font-semibold shadow-sm mb-4 w-fit`}
        >
          {priorityConfig.icon}
          <span className="hidden sm:inline">{priorityConfig.text}</span>
          <span className="sm:hidden">P{item.priority}</span>
        </div>

        {/* Header Section */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            {item.name?.charAt(0) || "?"}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-emerald-700 transition-colors">
              {item.name || "Anonymous Request"}
            </h3>
            <p className="text-sm text-gray-500">
              ID: {item._id?.slice(-8) || "N/A"}
            </p>
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <MdLocationOn className="text-red-500 text-lg flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">Location</p>
              <p className="font-medium text-gray-900 text-sm truncate">
                {item.district || "Unknown"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <MdPeople className="text-blue-500 text-lg flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">People</p>
              <p className="font-medium text-gray-900 text-sm">
                {item.numberOfPeople || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <MdPhone className="text-green-500 text-lg flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">Contact</p>
              <p className="font-medium text-gray-900 text-sm truncate">
                {item.phone?.[0] || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <MdAccessTime className="text-purple-500 text-lg flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Posted</p>
              <p className="font-medium text-gray-900 text-sm">
                {formatTime(item.timestamp)}
              </p>
            </div>
          </div>
        </div>

        {/* Status & Verification */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={`px-3 py-1 rounded-full border flex items-center gap-2 ${statusConfig.color}`}
            >
              {statusConfig.icon}
              <span className="text-sm font-medium">
                {item.status || "Pending"}
              </span>
            </div>
            {item.verified && (
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <MdVerified className="text-sm" />
                <span className="text-xs font-medium">Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Requirements Preview */}
        {item.requirements &&
          Array.isArray(item.requirements) &&
          item.requirements.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">
                Requirements
              </p>
              <div className="flex flex-wrap gap-2">
                {item.requirements
                  .slice(0, expanded ? item.requirements.length : 2)
                  .map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-lg"
                    >
                      {getRequirementIcon(req)}
                      <span className="text-sm font-medium text-emerald-800">
                        {req}
                      </span>
                    </div>
                  ))}
                {item.requirements.length > 2 && !expanded && (
                  <button
                    onClick={() => setExpanded(true)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <MdExpandMore /> +{item.requirements.length - 2} more
                  </button>
                )}
              </div>
            </div>
          )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg font-medium hover:from-gray-800 hover:to-gray-900 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg flex-1"
          >
            <MdInfo className="text-lg" />
            View Details
          </button>
          <button
            onClick={() => handleDonateModalToggle(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg flex-1"
          >
            <MdAttachMoney className="text-lg" />
            Donate Now
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      {item.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {item.name || "Anonymous Request"}
                      </h2>
                      <p className="text-gray-300">
                        Request ID: {item._id?.slice(-8)}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <MdClose className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Priority & Status Banner */}
                <div className="flex flex-wrap gap-3">
                  <div
                    className={`${priorityConfig.color} text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold`}
                  >
                    {priorityConfig.icon}
                    {priorityConfig.text} Priority
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${statusConfig.color} font-medium`}
                  >
                    {statusConfig.icon}
                    Status: {item.status || "Pending"}
                  </div>
                  {item.verified && (
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 font-medium border border-emerald-200">
                      <MdVerified />
                      Verified Donor
                    </div>
                  )}
                </div>

                {/* Contact Information Grid */}
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <MdLocationOn className="text-red-500" />
                      Location Details
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">District</p>
                        <p className="font-medium">
                          {item.district || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Full Address</p>
                        <p className="font-medium">
                          {item.address || "Address not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <MdPeople className="text-blue-500" />
                      Family Details
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">
                          Number of People
                        </p>
                        <p className="font-medium">
                          {item.numberOfPeople || "Not specified"}
                        </p>
                      </div>
                      {item.time && (
                        <div>
                          <p className="text-xs text-gray-500">Request Time</p>
                          <p className="font-medium">{item.time}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Numbers */}
                {item.phone &&
                  Array.isArray(item.phone) &&
                  item.phone.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                        <MdPhone className="text-green-500" />
                        Contact Numbers
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {item.phone.map((num, idx) => (
                          <a
                            key={idx}
                            href={`tel:${num}`}
                            className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center gap-2 border border-green-200"
                          >
                            <MdPhone />
                            {num}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Requirements */}
                {item.requirements && Array.isArray(item.requirements) && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                      <MdLocalGroceryStore className="text-amber-500" />
                      Requirements Needed
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {item.requirements.map((req, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg"
                        >
                          <div className="p-2 bg-white rounded-lg">
                            {getRequirementIcon(req)}
                          </div>
                          <span className="font-medium text-emerald-900">
                            {req}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {item.notes && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                      <BsChatTextFill className="text-blue-500" />
                      Additional Notes
                    </h4>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-gray-700 italic leading-relaxed">
                        "{item.notes}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <p className="font-medium">Created</p>
                      <p>
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    {item.updatedAt && (
                      <div>
                        <p className="font-medium">Last Updated</p>
                        <p>{new Date(item.updatedAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors w-full sm:w-auto"
                >
                  Close
                </button>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {item.phone?.[0] && (
                    <a
                      href={`tel:${item.phone[0]}`}
                      className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <MdPhone />
                      Call Now
                    </a>
                  )}
                  <button
                    onClick={() => handleDonateModalToggle(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <MdAttachMoney />
                    Donate to Help
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donation Form Modal */}
      {isDonateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Make a Donation</h2>
                  <p className="text-emerald-100">
                    Help {item.name || "this family"} in need
                  </p>
                  <p className="text-sm text-emerald-200 mt-1">
                    Request ID: {item._id?.slice(-8)}
                  </p>
                </div>
                <button
                  onClick={() => handleDonateModalToggle(false)}
                  className="text-emerald-100 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <MdClose className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Donation Form */}
            <form
              onSubmit={handleDonationSubmit}
              className="p-6 overflow-y-auto flex-1"
            >
              <div className="space-y-6">
                {/* Donor Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Your Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="donorName"
                        value={donationForm.donorName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="donorPhone"
                        value={donationForm.donorPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="donorEmail"
                        value={donationForm.donorEmail}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information - IMPROVED */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                    <MdLocationOn className="mr-2 text-blue-500" />
                    Your Location Details
                  </h3>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* District Field */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <MdPublic className="h-4 w-4 mr-2 text-blue-500" />
                            District
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <span className="text-xs text-gray-500">Required</span>
                        </div>
                        <select
                          name="district"
                          value={donationForm.district}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-400 bg-white"
                        >
                          <option value="" disabled>Select District</option>
                          {districts.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <MdInfo className="h-3 w-3 mr-1" />
                          Select your administrative district
                        </div>
                      </div>
                      
                      {/* Location Field */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <FaMapMarkerAlt className="h-4 w-4 mr-2 text-emerald-500" />
                            Specific Location
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <span className="text-xs text-gray-500">Required</span>
                        </div>
                        <input
                          type="text"
                          name="location"
                          value={donationForm.location}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors hover:border-emerald-400 bg-white"
                          placeholder="Enter full address or area"
                        />
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <MdInfo className="h-3 w-3 mr-1" />
                          Enter detailed location for easy access
                        </div>
                      </div>
                    </div>
                    
                    {/* Location Preview */}
                    {donationForm.district && donationForm.location && (
                      <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <MdLocationOn className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">
                            Delivery Location:
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 font-medium">
                          {donationForm.location}, {donationForm.district} District
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Donation Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Donation Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What would you like to donate? *
                      <span className="text-gray-500 text-xs ml-1">
                        (Select all that apply)
                      </span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Categories.map((category) => (
                        <label
                          key={category.value}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                            donationForm.donationType.includes(category.value)
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={donationForm.donationType.includes(
                              category.value
                            )}
                            onChange={() =>
                              handleCategoryToggle(category.value)
                            }
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {category.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    {donationForm.donationType.length > 0 && (
                      <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="text-xs text-emerald-800 font-medium">
                          Selected:{" "}
                          <span className="font-normal">
                            {donationForm.donationType.join(", ")}
                          </span>
                        </p>
                      </div>
                    )}
                    {donationForm.donationType.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">
                        Please select at least one donation type
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Method *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          donationForm.deliveryMethod === "deliver"
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-300 hover:border-emerald-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="deliver"
                          checked={donationForm.deliveryMethod === "deliver"}
                          onChange={handleInputChange}
                          className="text-emerald-600 focus:ring-emerald-500 mr-3"
                        />
                        <div>
                          <p className="font-medium">I can deliver</p>
                          <p className="text-sm text-gray-500">
                            I will bring the items
                          </p>
                        </div>
                      </label>
                      <label
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          donationForm.deliveryMethod === "pickup"
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-300 hover:border-emerald-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="pickup"
                          checked={donationForm.deliveryMethod === "pickup"}
                          onChange={handleInputChange}
                          className="text-emerald-600 focus:ring-emerald-500 mr-3"
                        />
                        <div>
                          <p className="font-medium">Pick up needed</p>
                          <p className="text-sm text-gray-500">
                            Need assistance
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={donationForm.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Any special instructions, timing preferences, or additional information..."
                    />
                  </div>
                </div>

                {/* Request Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    You are helping:
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-500">Recipient ID:</span>{" "}
                      <span className="font-medium">
                        {item._id?.slice(-8) || "Anonymous"}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Recipient:</span>{" "}
                      <span className="font-medium">
                        {item.name || "Anonymous"}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Location:</span>{" "}
                      <span className="font-medium">
                        {item.district || "Not specified"}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">People in need:</span>{" "}
                      <span className="font-medium">
                        {item.numberOfPeople || "Not specified"}
                      </span>
                    </p>
                    {item.requirements && item.requirements.length > 0 && (
                      <p>
                        <span className="text-gray-500">Needed:</span>{" "}
                        <span className="font-medium">
                          {item.requirements.join(", ")}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleDonateModalToggle(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      handleDonateModalToggle(false);
                      setIsModalOpen(true);
                    }}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 flex-1"
                  >
                    <MdInfo />
                    View Request
                  </button>
                  <button
                    type="submit"
                    onClick={handleDonationSubmit}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 flex-1"
                  >
                    <MdCheckCircle className="text-lg" />
                    Submit Donation
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                Your information will be shared with the requester for
                coordination purposes.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}