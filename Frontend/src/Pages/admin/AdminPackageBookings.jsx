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
  const [showCallLogModal, setShowCallLogModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [showMarkFakeModal, setShowMarkFakeModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [selectedDonationIndex, setSelectedDonationIndex] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [callLogStatus, setCallLogStatus] = useState("answered");
  const [callLogNotes, setCallLogNotes] = useState("");
  const [callLogDuration, setCallLogDuration] = useState(60);

  // Form states for add/edit
  const [formData, setFormData] = useState({
    contactName: "",
    phoneNumbers: [{ number: "", isPrimary: true }],
    location: {
      district: "",
      address: "",
      googleMapsLink: "",
      accessNotes: "",
    },
    peopleCount: {
      families: 1,
      individuals: 1,
      children: 0,
      infants: 0,
      elderly: 0,
      pregnantWomen: 0,
      animals: 0,
    },
    aidRequired: [],
    otherRequirements: "",
    urgencyLevel: 3,
    timeCalled: "",
    requiredBy: "",
    remarks: "",
    disasterType: "flood",
  });

  // Aid categories
  const aidCategories = [
    { value: "foodCooked", label: "Cooked Meals" },
    { value: "foodDry", label: "Dry Rations (Rice, Flour, Lentils)" },
    { value: "water", label: "Drinking Water" },
    { value: "medicine", label: "Essential Medicines/First Aid" },
    { value: "clothing", label: "Blankets/Clothes" },
    { value: "sanitary", label: "Sanitary Items/Toiletries" },
    { value: "babyItems", label: "Baby Items (Milk powder, Diapers)" },
    { value: "stationery", label: "Stationery Items" },
    { value: "cleaning", label: "Cleaning Supplies" },
    { value: "other", label: "Other" },
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
  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/donation-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch donation requests");
      }

      const data = await response.json();
      if (data.success) {
        setDonations(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setErrorMessage(error.message);
      // For demo purposes, show sample data
      setDonations([
        {
          _id: "1",
          requestNumber: "DR241201-001",
          contactName: "අයිමන්",
          phoneNumbers: [{ number: "0705135895", isPrimary: true }],
          location: {
            district: "Gampaha",
            address: "රක්ෂපාන ජුම්මා මස්ජිදය",
          },
          peopleCount: {
            families: 1500,
            individuals: 6000,
            children: 2000,
            infants: 100,
            elderly: 500,
          },
          aidRequired: [
            {
              category: "foodDry",
              specificItems: ["Rice", "Flour", "Lentils"],
            },
            { category: "sanitary", specificItems: ["Soap", "Sanitary pads"] },
          ],
          urgencyLevel: 3,
          status: "published",
          isPublished: true,
          isVerified: true,
          createdAt: "2025-12-02T09:04:40.602Z",
        },
        {
          _id: "2",
          requestNumber: "DR241201-002",
          contactName: "P.A.U Priyantha Peramuna",
          phoneNumbers: [
            { number: "0718501072", isPrimary: true },
            { number: "0711297702", isPrimary: false },
          ],
          location: {
            district: "Kandy",
            address: "Kandy , Gampola , Apalawatta",
          },
          peopleCount: {
            families: 500,
            individuals: 2000,
            children: 800,
            infants: 50,
            elderly: 300,
          },
          aidRequired: [
            { category: "foodCooked", specificItems: ["Cooked Meals"] },
          ],
          urgencyLevel: 3,
          status: "verified",
          isPublished: false,
          isVerified: true,
          createdAt: "2025-12-02T09:09:21.770Z",
        },
        {
          _id: "3",
          requestNumber: "DR241201-003",
          contactName: "Wasana pathirana",
          phoneNumbers: [{ number: "0725447333", isPrimary: true }],
          location: {
            district: "Colombo",
            address: "Ranala",
          },
          peopleCount: {
            families: 2,
            individuals: 8,
            children: 2,
            infants: 1,
            animals: 10,
          },
          aidRequired: [
            {
              category: "babyItems",
              specificItems: ["Milk powder", "Diapers"],
            },
            { category: "sanitary", specificItems: ["Soap", "Toothpaste"] },
          ],
          urgencyLevel: 3,
          status: "draft",
          isPublished: false,
          isVerified: false,
          createdAt: "2025-12-02T09:34:34.395Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Search function
  const handleSearch = () => {
    const searchTerm = searchKey.trim().toLowerCase();

    if (!searchTerm) {
      fetchDonations();
      return;
    }

    const filtered = donations.filter(
      (donation) =>
        (donation.contactName &&
          donation.contactName.toLowerCase().includes(searchTerm)) ||
        (donation.requestNumber &&
          donation.requestNumber.toLowerCase().includes(searchTerm)) ||
        (donation.phoneNumbers &&
          donation.phoneNumbers.some(
            (p) => p.number && p.number.includes(searchTerm)
          )) ||
        (donation.location &&
          donation.location.address.toLowerCase().includes(searchTerm)) ||
        (donation.location &&
          donation.location.district.toLowerCase().includes(searchTerm))
    );

    setDonations(filtered);
  };

  // Add new phone number
  const addPhoneNumber = () => {
    setFormData({
      ...formData,
      phoneNumbers: [
        ...formData.phoneNumbers,
        { number: "", isPrimary: false },
      ],
    });
  };

  // Update phone number
  const updatePhoneNumber = (index, field, value) => {
    const newPhoneNumbers = [...formData.phoneNumbers];
    newPhoneNumbers[index][field] = value;

    // If setting as primary, unset others
    if (field === "isPrimary" && value) {
      newPhoneNumbers.forEach((phone, i) => {
        if (i !== index) phone.isPrimary = false;
      });
    }

    setFormData({ ...formData, phoneNumbers: newPhoneNumbers });
  };

  // Remove phone number
  const removePhoneNumber = (index) => {
    const newPhoneNumbers = formData.phoneNumbers.filter((_, i) => i !== index);
    setFormData({ ...formData, phoneNumbers: newPhoneNumbers });
  };

  // Update form data
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Add aid requirement
  const addAidRequirement = () => {
    setFormData({
      ...formData,
      aidRequired: [
        ...formData.aidRequired,
        { category: "", specificItems: [""] },
      ],
    });
  };

  // Update aid requirement
  const updateAidRequirement = (index, field, value) => {
    const newAidRequired = [...formData.aidRequired];

    if (field === "specificItems") {
      newAidRequired[index].specificItems = [value];
    } else {
      newAidRequired[index][field] = value;
    }

    setFormData({ ...formData, aidRequired: newAidRequired });
  };

  // Remove aid requirement
  const removeAidRequirement = (index) => {
    const newAidRequired = formData.aidRequired.filter((_, i) => i !== index);
    setFormData({ ...formData, aidRequired: newAidRequired });
  };

  // Add new donation request
  const handleAddDonation = async () => {
    try {
      // Validate required fields
      if (!formData.contactName.trim()) {
        setErrorMessage("Contact name is required");
        return;
      }

      if (!formData.phoneNumbers[0]?.number.trim()) {
        setErrorMessage("At least one phone number is required");
        return;
      }

      if (!formData.location.district || !formData.location.address.trim()) {
        setErrorMessage("District and address are required");
        return;
      }

      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/donation-requests", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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

      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `/api/donation-requests/${selectedDonation._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
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

      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `/api/donation-requests/${selectedDonation._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete donation request");
      }

      if (data.success) {
        setSuccessMessage("Donation request archived successfully!");
        setShowDeleteModal(false);
        fetchDonations();
      }
    } catch (error) {
      console.error("Delete donation error:", error);
      setErrorMessage(error.message);
    }
  };

  // Add call log
  const handleAddCallLog = async () => {
    try {
      if (!selectedDonation) return;

      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `/api/donation-requests/${selectedDonation._id}/calls`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: callLogStatus,
            notes: callLogNotes,
            duration: callLogDuration,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add call log");
      }

      if (data.success) {
        setSuccessMessage("Call log added successfully!");
        setShowCallLogModal(false);
        setCallLogStatus("answered");
        setCallLogNotes("");
        setCallLogDuration(60);
        fetchDonations();
      }
    } catch (error) {
      console.error("Add call log error:", error);
      setErrorMessage(error.message);
    }
  };

  // Verify request
  const handleVerifyRequest = async () => {
    try {
      if (!selectedDonation) return;

      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `/api/donation-requests/${selectedDonation._id}/verify`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            verificationMethod: "call_back",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify request");
      }

      if (data.success) {
        setSuccessMessage("Donation request verified successfully!");
        setShowVerifyModal(false);
        fetchDonations();
      }
    } catch (error) {
      console.error("Verify request error:", error);
      setErrorMessage(error.message);
    }
  };

  // Publish request
  const handlePublishRequest = async () => {
    try {
      if (!selectedDonation) return;

      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `/api/donation-requests/${selectedDonation._id}/publish`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to publish request");
      }

      if (data.success) {
        setSuccessMessage("Donation request published to website!");
        setShowPublishModal(false);
        fetchDonations();
      }
    } catch (error) {
      console.error("Publish request error:", error);
      setErrorMessage(error.message);
    }
  };

  // Fulfill request
  const handleFulfillRequest = async () => {
    try {
      if (!selectedDonation) return;

      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `/api/donation-requests/${selectedDonation._id}/fulfill`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark as fulfilled");
      }

      if (data.success) {
        setSuccessMessage("Donation request marked as fulfilled!");
        setShowFulfillModal(false);
        fetchDonations();
      }
    } catch (error) {
      console.error("Fulfill request error:", error);
      setErrorMessage(error.message);
    }
  };

  // Mark as fake
  const handleMarkFake = async () => {
    try {
      if (!selectedDonation) return;

      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `/api/donation-requests/${selectedDonation._id}/fake`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notes: "Marked as fake by admin",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark as fake");
      }

      if (data.success) {
        setSuccessMessage("Donation request marked as fake!");
        setShowMarkFakeModal(false);
        fetchDonations();
      }
    } catch (error) {
      console.error("Mark fake error:", error);
      setErrorMessage(error.message);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      contactName: "",
      phoneNumbers: [{ number: "", isPrimary: true }],
      location: {
        district: "",
        address: "",
        googleMapsLink: "",
        accessNotes: "",
      },
      peopleCount: {
        families: 1,
        individuals: 1,
        children: 0,
        infants: 0,
        elderly: 0,
        pregnantWomen: 0,
        animals: 0,
      },
      aidRequired: [],
      otherRequirements: "",
      urgencyLevel: 3,
      timeCalled: "",
      requiredBy: "",
      remarks: "",
      disasterType: "flood",
    });
  };

  // Open edit modal with donation data
  const openEditModal = (donation, index) => {
    setSelectedDonation(donation);
    setSelectedDonationIndex(index);
    setFormData({
      contactName: donation.contactName || "",
      phoneNumbers: donation.phoneNumbers || [{ number: "", isPrimary: true }],
      location: donation.location || {
        district: "",
        address: "",
        googleMapsLink: "",
        accessNotes: "",
      },
      peopleCount: donation.peopleCount || {
        families: 1,
        individuals: 1,
        children: 0,
        infants: 0,
        elderly: 0,
        pregnantWomen: 0,
        animals: 0,
      },
      aidRequired: donation.aidRequired || [],
      otherRequirements: donation.otherRequirements || "",
      urgencyLevel: donation.urgencyLevel || 3,
      timeCalled: donation.timeCalled || "",
      requiredBy: donation.requiredBy || "",
      remarks: donation.remarks || "",
      disasterType: donation.disasterType || "flood",
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
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "verification":
        return "bg-yellow-100 text-yellow-800";
      case "verified":
        return "bg-blue-100 text-blue-800";
      case "published":
        return "bg-green-100 text-green-800";
      case "donor_assigned":
        return "bg-purple-100 text-purple-800";
      case "partially_fulfilled":
        return "bg-indigo-100 text-indigo-800";
      case "fulfilled":
        return "bg-teal-100 text-teal-800";
      case "fake":
        return "bg-red-100 text-red-800";
      case "archived":
        return "bg-gray-200 text-gray-600";
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
    });
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
            <div>
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
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add New Request
            </button>
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
      <div className="flex justify-between mb-4">
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
      </div>

      {/* Donations Table */}
      <div className="card">
        <div className="card-header p-4">
          <h4>All Donation Requests ({donations.length})</h4>
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
                      Request ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Contact Info
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      People
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Aid Required
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
                        <div className="font-mono text-xs font-semibold">
                          {donation.requestNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {donation.contactName || "Not mentioned"}
                        </div>
                        {donation.phoneNumbers &&
                          donation.phoneNumbers.length > 0 && (
                            <div className="text-gray-600 text-sm mt-1">
                              {donation.phoneNumbers.find((p) => p.isPrimary)
                                ?.number || donation.phoneNumbers[0].number}
                            </div>
                          )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {donation.location?.district}
                        </div>
                        <div className="text-gray-600 text-sm mt-1 truncate max-w-xs">
                          {donation.location?.address}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <div className="text-sm">
                            {donation.peopleCount?.families || 0} families
                          </div>
                          <div className="text-xs text-gray-500">
                            {donation.peopleCount?.individuals || 0} people
                          </div>
                          {(donation.peopleCount?.children > 0 ||
                            donation.peopleCount?.infants > 0 ||
                            donation.peopleCount?.elderly > 0) && (
                            <div className="text-xs text-blue-600 mt-1">
                              {donation.peopleCount.children > 0 &&
                                `👶 ${donation.peopleCount.children} `}
                              {donation.peopleCount.infants > 0 &&
                                `🍼 ${donation.peopleCount.infants} `}
                              {donation.peopleCount.elderly > 0 &&
                                `👵 ${donation.peopleCount.elderly}`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {donation.aidRequired &&
                            donation.aidRequired.slice(0, 2).map((aid, i) => (
                              <span
                                key={i}
                                className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded mr-1"
                              >
                                {aidCategories.find(
                                  (c) => c.value === aid.category
                                )?.label || aid.category}
                              </span>
                            ))}
                          {donation.aidRequired &&
                            donation.aidRequired.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{donation.aidRequired.length - 2} more
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                            donation.urgencyLevel
                          )}`}
                        >
                          Level {donation.urgencyLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              donation.status
                            )}`}
                          >
                            {donation.status.charAt(0).toUpperCase() +
                              donation.status.slice(1)}
                          </span>
                          {donation.isVerified && (
                            <span className="text-xs text-green-600 flex items-center">
                              <Check className="h-3 w-3 mr-1" /> Verified
                            </span>
                          )}
                          {donation.isPublished && (
                            <span className="text-xs text-blue-600 flex items-center">
                              <Globe className="h-3 w-3 mr-1" /> Published
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
                            onClick={() => openEditModal(donation, index)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDonation(donation);
                              setShowCallLogModal(true);
                            }}
                            className="p-1 text-purple-600 hover:text-purple-800"
                            title="Add Call Log"
                          >
                            <Phone className="h-4 w-4" />
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
                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Name *
                          </label>
                          <input
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter contact person name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Disaster Type
                          </label>
                          <select
                            name="disasterType"
                            value={formData.disasterType}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="flood">Flood</option>
                            <option value="landslide">Landslide</option>
                            <option value="storm">Storm</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Phone Numbers */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Numbers *
                        </label>
                        {formData.phoneNumbers.map((phone, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 mb-2"
                          >
                            <input
                              type="text"
                              value={phone.number}
                              onChange={(e) =>
                                updatePhoneNumber(
                                  index,
                                  "number",
                                  e.target.value
                                )
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0712345678"
                            />
                            <label className="flex items-center space-x-1">
                              <input
                                type="checkbox"
                                checked={phone.isPrimary}
                                onChange={(e) =>
                                  updatePhoneNumber(
                                    index,
                                    "isPrimary",
                                    e.target.checked
                                  )
                                }
                                className="rounded"
                              />
                              <span className="text-sm text-gray-600">
                                Primary
                              </span>
                            </label>
                            {formData.phoneNumbers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePhoneNumber(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addPhoneNumber}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          + Add another phone number
                        </button>
                      </div>

                      {/* Location Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            District *
                          </label>
                          <select
                            name="location.district"
                            value={formData.location.district}
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
                            name="urgencyLevel"
                            value={formData.urgencyLevel}
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
                          name="location.address"
                          value={formData.location.address}
                          onChange={handleInputChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter full address"
                        />
                      </div>

                      {/* People Count */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          People Information
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Families
                            </label>
                            <input
                              type="number"
                              name="peopleCount.families"
                              value={formData.peopleCount.families}
                              onChange={handleInputChange}
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Individuals
                            </label>
                            <input
                              type="number"
                              name="peopleCount.individuals"
                              value={formData.peopleCount.individuals}
                              onChange={handleInputChange}
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Children
                            </label>
                            <input
                              type="number"
                              name="peopleCount.children"
                              value={formData.peopleCount.children}
                              onChange={handleInputChange}
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Infants
                            </label>
                            <input
                              type="number"
                              name="peopleCount.infants"
                              value={formData.peopleCount.infants}
                              onChange={handleInputChange}
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Elderly
                            </label>
                            <input
                              type="number"
                              name="peopleCount.elderly"
                              value={formData.peopleCount.elderly}
                              onChange={handleInputChange}
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Pregnant Women
                            </label>
                            <input
                              type="number"
                              name="peopleCount.pregnantWomen"
                              value={formData.peopleCount.pregnantWomen}
                              onChange={handleInputChange}
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Animals
                            </label>
                            <input
                              type="number"
                              name="peopleCount.animals"
                              value={formData.peopleCount.animals}
                              onChange={handleInputChange}
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Aid Requirements */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Aid Requirements
                          </label>
                          <button
                            type="button"
                            onClick={addAidRequirement}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            + Add Aid Requirement
                          </button>
                        </div>
                        {formData.aidRequired.map((aid, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 mb-2"
                          >
                            <select
                              value={aid.category}
                              onChange={(e) =>
                                updateAidRequirement(
                                  index,
                                  "category",
                                  e.target.value
                                )
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Aid Type</option>
                              {aidCategories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={aid.specificItems?.[0] || ""}
                              onChange={(e) =>
                                updateAidRequirement(
                                  index,
                                  "specificItems",
                                  e.target.value
                                )
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Specific items (optional)"
                            />
                            <button
                              type="button"
                              onClick={() => removeAidRequirement(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                        {formData.aidRequired.length === 0 && (
                          <div className="text-gray-500 text-sm italic">
                            No aid requirements added yet. Click "Add Aid
                            Requirement" to add.
                          </div>
                        )}
                      </div>

                      {/* Other Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time Called (Optional)
                          </label>
                          <input
                            type="text"
                            name="timeCalled"
                            value={formData.timeCalled}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 09:30 AM"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Required By (Optional)
                          </label>
                          <input
                            type="text"
                            name="requiredBy"
                            value={formData.requiredBy}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Tomorrow morning"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Remarks / Notes
                        </label>
                        <textarea
                          name="remarks"
                          value={formData.remarks}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Additional notes or special requirements..."
                        />
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
                      <span className="ml-2 text-sm font-mono text-blue-600">
                        {selectedDonation?.requestNumber}
                      </span>
                    </h3>

                    {/* Same form as Add Modal, but with edit functionality */}
                    <div className="space-y-4">
                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Name *
                          </label>
                          <input
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Disaster Type
                          </label>
                          <select
                            name="disasterType"
                            value={formData.disasterType}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="flood">Flood</option>
                            <option value="landslide">Landslide</option>
                            <option value="storm">Storm</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Phone Numbers */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Numbers *
                        </label>
                        {formData.phoneNumbers.map((phone, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 mb-2"
                          >
                            <input
                              type="text"
                              value={phone.number}
                              onChange={(e) =>
                                updatePhoneNumber(
                                  index,
                                  "number",
                                  e.target.value
                                )
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            <label className="flex items-center space-x-1">
                              <input
                                type="checkbox"
                                checked={phone.isPrimary}
                                onChange={(e) =>
                                  updatePhoneNumber(
                                    index,
                                    "isPrimary",
                                    e.target.checked
                                  )
                                }
                                className="rounded"
                              />
                              <span className="text-sm text-gray-600">
                                Primary
                              </span>
                            </label>
                            {formData.phoneNumbers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePhoneNumber(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addPhoneNumber}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          + Add another phone number
                        </button>
                      </div>

                      {/* Location Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            District *
                          </label>
                          <select
                            name="location.district"
                            value={formData.location.district}
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
                            name="urgencyLevel"
                            value={formData.urgencyLevel}
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
                          name="location.address"
                          value={formData.location.address}
                          onChange={handleInputChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* People Count */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          People Information
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Families
                            </label>
                            <input
                              type="number"
                              name="peopleCount.families"
                              value={formData.peopleCount.families}
                              onChange={handleInputChange}
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Individuals
                            </label>
                            <input
                              type="number"
                              name="peopleCount.individuals"
                              value={formData.peopleCount.individuals}
                              onChange={handleInputChange}
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Children
                            </label>
                            <input
                              type="number"
                              name="peopleCount.children"
                              value={formData.peopleCount.children}
                              onChange={handleInputChange}
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Infants
                            </label>
                            <input
                              type="number"
                              name="peopleCount.infants"
                              value={formData.peopleCount.infants}
                              onChange={handleInputChange}
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Aid Requirements */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Aid Requirements
                          </label>
                          <button
                            type="button"
                            onClick={addAidRequirement}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            + Add Aid Requirement
                          </button>
                        </div>
                        {formData.aidRequired.map((aid, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 mb-2"
                          >
                            <select
                              value={aid.category}
                              onChange={(e) =>
                                updateAidRequirement(
                                  index,
                                  "category",
                                  e.target.value
                                )
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Aid Type</option>
                              {aidCategories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={aid.specificItems?.[0] || ""}
                              onChange={(e) =>
                                updateAidRequirement(
                                  index,
                                  "specificItems",
                                  e.target.value
                                )
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Specific items"
                            />
                            <button
                              type="button"
                              onClick={() => removeAidRequirement(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Remarks */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Remarks / Notes
                        </label>
                        <textarea
                          name="remarks"
                          value={formData.remarks}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
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
                            <div className="text-sm text-gray-600">
                              Request ID
                            </div>
                            <div className="font-mono font-semibold">
                              {selectedDonation.requestNumber}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Status</div>
                            <div
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                selectedDonation.status
                              )}`}
                            >
                              {selectedDonation.status.charAt(0).toUpperCase() +
                                selectedDonation.status.slice(1)}
                            </div>
                            {selectedDonation.isVerified && (
                              <div className="text-xs text-green-600 mt-1">
                                ✓ Verified
                              </div>
                            )}
                            {selectedDonation.isPublished && (
                              <div className="text-xs text-blue-600">
                                🌐 Published
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Urgency</div>
                            <div
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(
                                selectedDonation.urgencyLevel
                              )}`}
                            >
                              Level {selectedDonation.urgencyLevel}
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
                                {selectedDonation.contactName ||
                                  "Not mentioned"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">
                                Phone Numbers
                              </div>
                              <div className="space-y-1">
                                {selectedDonation.phoneNumbers?.map(
                                  (phone, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center"
                                    >
                                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                      <span
                                        className={
                                          phone.isPrimary ? "font-medium" : ""
                                        }
                                      >
                                        {phone.number}
                                        {phone.isPrimary && (
                                          <span className="ml-2 text-xs text-blue-600">
                                            (Primary)
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  )
                                )}
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
                                {selectedDonation.location?.district}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">
                                Address
                              </div>
                              <div className="font-medium">
                                {selectedDonation.location?.address}
                              </div>
                            </div>
                            {selectedDonation.location?.googleMapsLink && (
                              <div>
                                <div className="text-sm text-gray-600">
                                  Google Maps
                                </div>
                                <a
                                  href={
                                    selectedDonation.location.googleMapsLink
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  View on Maps
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* People Information */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          People Information
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {selectedDonation.peopleCount?.families || 0}
                            </div>
                            <div className="text-sm text-gray-600">
                              Families
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {selectedDonation.peopleCount?.individuals || 0}
                            </div>
                            <div className="text-sm text-gray-600">
                              Individuals
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {selectedDonation.peopleCount?.children || 0}
                            </div>
                            <div className="text-sm text-gray-600">
                              Children
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {selectedDonation.peopleCount?.infants || 0}
                            </div>
                            <div className="text-sm text-gray-600">Infants</div>
                          </div>
                          {(selectedDonation.peopleCount?.elderly > 0 ||
                            selectedDonation.peopleCount?.pregnantWomen >
                              0) && (
                            <>
                              <div>
                                <div className="text-2xl font-bold text-orange-600">
                                  {selectedDonation.peopleCount?.elderly || 0}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Elderly
                                </div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-pink-600">
                                  {selectedDonation.peopleCount
                                    ?.pregnantWomen || 0}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Pregnant Women
                                </div>
                              </div>
                            </>
                          )}
                          {selectedDonation.peopleCount?.animals > 0 && (
                            <div>
                              <div className="text-2xl font-bold text-green-600">
                                {selectedDonation.peopleCount?.animals || 0}
                              </div>
                              <div className="text-sm text-gray-600">
                                Animals
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Aid Requirements */}
                      {selectedDonation.aidRequired &&
                        selectedDonation.aidRequired.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Aid Requirements
                            </h4>
                            <div className="space-y-3">
                              {selectedDonation.aidRequired.map(
                                (aid, index) => (
                                  <div
                                    key={index}
                                    className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r"
                                  >
                                    <div className="font-medium">
                                      {aidCategories.find(
                                        (c) => c.value === aid.category
                                      )?.label || aid.category}
                                    </div>
                                    {aid.specificItems &&
                                      aid.specificItems.length > 0 && (
                                        <div className="text-sm text-gray-700 mt-1">
                                          <span className="font-medium">
                                            Specific items:
                                          </span>{" "}
                                          {aid.specificItems.join(", ")}
                                        </div>
                                      )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Other Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedDonation.timeCalled && (
                          <div>
                            <div className="text-sm text-gray-600">
                              Time Called
                            </div>
                            <div>{selectedDonation.timeCalled}</div>
                          </div>
                        )}
                        {selectedDonation.requiredBy && (
                          <div>
                            <div className="text-sm text-gray-600">
                              Required By
                            </div>
                            <div>{selectedDonation.requiredBy}</div>
                          </div>
                        )}
                        {selectedDonation.disasterType && (
                          <div>
                            <div className="text-sm text-gray-600">
                              Disaster Type
                            </div>
                            <div className="capitalize">
                              {selectedDonation.disasterType}
                            </div>
                          </div>
                        )}
                        {selectedDonation.otherRequirements && (
                          <div className="md:col-span-2">
                            <div className="text-sm text-gray-600">
                              Other Requirements
                            </div>
                            <div>{selectedDonation.otherRequirements}</div>
                          </div>
                        )}
                        {selectedDonation.remarks && (
                          <div className="md:col-span-2">
                            <div className="text-sm text-gray-600">Remarks</div>
                            <div className="italic">
                              {selectedDonation.remarks}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t">
                        <div className="flex flex-wrap gap-2">
                          {!selectedDonation.isVerified &&
                            selectedDonation.status !== "fake" && (
                              <button
                                onClick={() => {
                                  setShowViewModal(false);
                                  setShowVerifyModal(true);
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                              >
                                <Check className="h-4 w-4 inline mr-2" />
                                Verify Request
                              </button>
                            )}
                          {selectedDonation.isVerified &&
                            !selectedDonation.isPublished && (
                              <button
                                onClick={() => {
                                  setShowViewModal(false);
                                  setShowPublishModal(true);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                <Globe className="h-4 w-4 inline mr-2" />
                                Publish to Website
                              </button>
                            )}
                          {selectedDonation.isPublished &&
                            selectedDonation.status !== "fulfilled" && (
                              <button
                                onClick={() => {
                                  setShowViewModal(false);
                                  setShowFulfillModal(true);
                                }}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                              >
                                ✓ Mark as Fulfilled
                              </button>
                            )}
                          <button
                            onClick={() => {
                              setShowViewModal(false);
                              setShowCallLogModal(true);
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          >
                            <Phone className="h-4 w-4 inline mr-2" />
                            Add Call Log
                          </button>
                          {selectedDonation.status !== "fake" && (
                            <button
                              onClick={() => {
                                setShowViewModal(false);
                                setShowMarkFakeModal(true);
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              🚫 Mark as Fake
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call Log Modal */}
      {showCallLogModal && selectedDonation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      <Phone className="h-6 w-6 inline mr-2" />
                      Add Call Log
                      <span className="ml-2 text-sm font-normal text-gray-600">
                        for {selectedDonation.contactName}
                      </span>
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Call Status *
                        </label>
                        <select
                          value={callLogStatus}
                          onChange={(e) => setCallLogStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="answered">Answered</option>
                          <option value="not_answered">Not Answered</option>
                          <option value="busy">Busy</option>
                          <option value="wrong_number">Wrong Number</option>
                          <option value="fake">Fake</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Call Duration (seconds)
                        </label>
                        <input
                          type="number"
                          value={callLogDuration}
                          onChange={(e) =>
                            setCallLogDuration(parseInt(e.target.value) || 0)
                          }
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={callLogNotes}
                          onChange={(e) => setCallLogNotes(e.target.value)}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter call details, verification information, etc."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddCallLog}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add Call Log
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCallLogModal(false);
                    setCallLogStatus("answered");
                    setCallLogNotes("");
                    setCallLogDuration(60);
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
                        Are you sure you want to archive this donation request?
                        <br />
                        <b>Request ID:</b> {selectedDonation.requestNumber}
                        <br />
                        <b>Contact:</b> {selectedDonation.contactName}
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
                  Yes, Archive
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

      {/* Verify Request Modal */}
      {showVerifyModal && selectedDonation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-green-600">
                      <Check className="h-6 w-6 inline mr-2" />
                      Verify Request
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to verify this donation request?
                        <br />
                        <b>Request ID:</b> {selectedDonation.requestNumber}
                        <br />
                        <b>Contact:</b> {selectedDonation.contactName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleVerifyRequest}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Yes, Verify
                </button>
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Request Modal */}
      {showPublishModal && selectedDonation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-blue-600">
                      <Globe className="h-6 w-6 inline mr-2" />
                      Publish to Website
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to publish this request to the
                        public website?
                        <br />
                        <b>Request ID:</b> {selectedDonation.requestNumber}
                        <br />
                        This will make it visible to donors.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handlePublishRequest}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Yes, Publish
                </button>
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fulfill Request Modal */}
      {showFulfillModal && selectedDonation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-teal-600">
                      ✓ Mark as Fulfilled
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure all aid requirements have been fulfilled?
                        <br />
                        <b>Request ID:</b> {selectedDonation.requestNumber}
                        <br />
                        This will remove it from the public website.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleFulfillRequest}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Yes, Mark as Fulfilled
                </button>
                <button
                  type="button"
                  onClick={() => setShowFulfillModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Fake Modal */}
      {showMarkFakeModal && selectedDonation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-red-600">
                      🚫 Mark as Fake
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Warning: This action cannot be undone.
                        <br />
                        <b>Request ID:</b> {selectedDonation.requestNumber}
                        <br />
                        <b>Contact:</b> {selectedDonation.contactName}
                        <br />
                        This will mark the request as fake and remove it from
                        the system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleMarkFake}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Yes, Mark as Fake
                </button>
                <button
                  type="button"
                  onClick={() => setShowMarkFakeModal(false)}
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
