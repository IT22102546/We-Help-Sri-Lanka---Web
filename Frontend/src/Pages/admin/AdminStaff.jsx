import { Search, Edit, Trash2, Plus, AlertCircle, UserCheck, Shield, Phone } from "lucide-react";
import React, { useState, useEffect } from "react";
import { FaHome, FaUsers, FaPhone, FaEnvelope, FaCalendarAlt, FaUserShield, FaExclamationTriangle } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminStaff() {
  const [staffMembers, setStaffMembers] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    tp: "",
    status: "admin", 
    isActive: true,
    permissions: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user) || {};

  // Toast notification function
  const showToast = (message, type = 'success') => {
    if (type === 'success') {
      toast.success(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else if (type === 'error') {
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else if (type === 'warning') {
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

  // Filter out superadmin accounts
  const filterSuperAdmin = (staffArray) => {
    return staffArray.filter(staff => 
      staff.status !== "superadmin" && staff.email !== "superadmin@example.com"
    );
  };

  // Fetch staff data
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/staff/getAll");
      if (!response.ok) {
        throw new Error("Failed to fetch staff members");
      }
      const data = await response.json();

      // Extract users array from the response
      const staffArray = data.users || data;
      
      // Filter out superadmin accounts
      const filteredArray = filterSuperAdmin(staffArray);
      
      setStaffMembers(filteredArray);
      setFilteredStaff(filteredArray);
      showToast(`Loaded ${filteredArray.length} staff members`, 'success');
    } catch (error) {
      console.error("Error fetching staff:", error);
      showToast("Failed to load staff members", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Search function - client-side filtering
  const handleSearch = () => {
    if (!searchKey.trim()) {
      setFilteredStaff(staffMembers);
      return;
    }

    const searchTerm = searchKey.toLowerCase().trim();
    const filtered = staffMembers.filter(staff => 
      staff.name?.toLowerCase().includes(searchTerm) ||
      staff.email?.toLowerCase().includes(searchTerm) ||
      staff.tp?.toLowerCase().includes(searchTerm)
    );
    
    setFilteredStaff(filtered);
    
    if (filtered.length === 0 && searchTerm) {
      showToast(`No staff members found for "${searchTerm}"`, 'warning');
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKey, staffMembers]);

  // Form validation
  const validateForm = (isEdit = false) => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    // Phone validation for Sri Lankan numbers
    if (!isEdit && !formData.tp.trim()) {
      newErrors.tp = "Phone number is required";
    } else if (formData.tp && !/^(0\d{9})$/.test(formData.tp)) {
      newErrors.tp = "Enter a valid 10-digit Sri Lankan phone number (e.g., 0771234567)";
    }
    
    if (!isEdit && !formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add new staff
  const handleAddStaff = async (e) => {
    e.preventDefault();
    
    if (!validateForm(false)) {
      showToast("Please fix the form errors", 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/staff/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim(),
          tp: formData.tp.trim(),
          status: "admin", // Default status from backend
          isActive: true,
          permissions: []
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to add staff");
      }

      // Refresh staff list
      await fetchStaff();

      setShowAddModal(false);
      setFormData({ 
        name: "", 
        email: "", 
        password: "", 
        tp: "", 
        status: "admin",
        isActive: true,
        permissions: []
      });
      setErrors({});
      
      showToast("Staff member added successfully!", 'success');
    } catch (error) {
      console.error("Add staff error:", error);
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit staff
  const handleEditStaff = async (e) => {
    e.preventDefault();
    
    if (!validateForm(true)) {
      showToast("Please fix the form errors", 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const staffId = selectedStaff._id || selectedStaff.id;
      if (!staffId) {
        showToast("Staff ID not found", 'error');
        return;
      }

      const updateData = { 
        name: formData.name.trim(),
        email: formData.email.trim(),
        tp: formData.tp.trim()
      };
      
      // Only include password if provided
      if (formData.password && formData.password.trim() !== "") {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/staff/updatemember/${staffId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to update staff");
      }

      // Refresh data
      await fetchStaff();
      
      setShowEditModal(false);
      setSelectedStaff(null);
      setFormData({ 
        name: "", 
        email: "", 
        password: "", 
        tp: "", 
        status: "admin",
        isActive: true,
        permissions: []
      });
      setErrors({});
      
      showToast("Staff updated successfully!", 'success');
    } catch (error) {
      console.error("Edit error:", error);
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete staff
  const handleDeleteClick = (staff) => {
    setSelectedStaff(staff);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedStaff) {
      showToast("No staff member selected for deletion.", 'error');
      return;
    }

    const staffId = selectedStaff._id;
    if (!staffId) {
      showToast("Cannot delete: Staff ID not found.", 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/staff/delete/${staffId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to delete staff");
      }

      // Update state
      const updatedStaff = staffMembers.filter(s => s._id !== staffId);
      const updatedFilteredStaff = filteredStaff.filter(s => s._id !== staffId);

      setStaffMembers(updatedStaff);
      setFilteredStaff(updatedFilteredStaff);
      setShowDeleteModal(false);
      setSelectedStaff(null);
      
      showToast(data.message || "Staff member deleted successfully!", 'success');
    } catch (error) {
      console.error("Delete error:", error);
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name || "",
      email: staff.email || "",
      password: "",
      tp: staff.tp || "",
      status: staff.status || "admin",
      isActive: staff.isActive !== false,
      permissions: staff.permissions || []
    });
    setErrors({});
    setShowEditModal(true);
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
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'superadmin': return 'bg-red-100 text-red-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'superadmin': return <UserCheck className="h-4 w-4" />;
      case 'staff': return <UserCheck className="h-4 w-4" />;
      default: return <UserCheck className="h-4 w-4" />;
    }
  };

  // Loading state
  if (loading && staffMembers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading staff members...</p>
      </div>
    );
  }

  // Stats card component
  const StatsCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color} transition-transform hover:scale-105`}>
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-opacity-20 bg-current mr-4">
          <Icon className="text-2xl" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <ToastContainer />
      
      {/* Hero Section with Sri Lanka Theme */}
      <div className="relative overflow-hidden rounded-2xl shadow-xl mb-8" style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #065f46 100%)'
      }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300 rounded-full -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-300 rounded-full translate-x-32 translate-y-32"></div>
        </div>
        
        <div className="relative z-10 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Management</h1>
              <p className="text-blue-100 text-lg">
                Managing relief operation team for Sri Lanka flood relief
              </p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2">
                <FaUsers className="text-xl" />
                <span className="font-semibold">{filteredStaff.length} Active Admins</span>
              </div>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <nav className="mt-6">
            <ol className="flex items-center space-x-2 text-sm">
              <li className="flex items-center">
                <a href="/" className="hover:text-blue-200 flex items-center">
                  <FaHome className="mr-2" />
                  Home
                </a>
              </li>
              <li className="text-gray-300">/</li>
              <li className="text-gray-300">Dashboard</li>
              <li className="text-gray-300">/</li>
              <li className="font-semibold">Admin Management</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          icon={FaUsers} 
          title="Total Admins" 
          value={filteredStaff.length}
          color="border-blue-500"
          subtitle="Excluding Super Admin"
        />
        <StatsCard 
          icon={FaUserShield} 
          title="Admin Staff" 
          value={filteredStaff.filter(s => s.status === 'admin').length}
          color="border-purple-500"
          subtitle="Administrative access"
        />
        <StatsCard 
          icon={FaPhone} 
          title="With Phone" 
          value={filteredStaff.filter(s => s.tp).length}
          color="border-green-500"
          subtitle="Contact numbers available"
        />
        <StatsCard 
          icon={FaCalendarAlt} 
          title="This Month" 
          value={filteredStaff.filter(s => {
            const joinDate = new Date(s.createdAt);
            const now = new Date();
            return joinDate.getMonth() === now.getMonth() && 
                   joinDate.getFullYear() === now.getFullYear();
          }).length}
          color="border-yellow-500"
          subtitle="New registrations"
        />
      </div>

      {/* Search and Add Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="w-full md:w-2/3">
            <div className="relative">
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Search staff by name, email, or phone number..."
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              {searchKey && (
                <button
                  onClick={() => setSearchKey("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            disabled={isSubmitting}
            className={`w-full md:w-auto bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl flex items-center justify-center shadow-lg transition-all ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-green-700 hover:scale-105'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Add New Admin
              </>
            )}
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Admins</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Showing {filteredStaff.length} of {staffMembers.length} members
              </span>
              <button
                onClick={fetchStaff}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Admin ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name & Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff, index) => (
                  <tr 
                    key={staff._id} 
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        SL{String(index + 1).padStart(3, '0')}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {staff._id?.slice(-6)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                          {staff.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {staff.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <FaEnvelope className="h-3 w-3 mr-1" />
                            {staff.email}
                          </div>
                          {staff.tp ? (
                            <div className="text-sm text-gray-500 flex items-center">
                              <FaPhone className="h-3 w-3 mr-1" />
                              {staff.tp}
                            </div>
                          ) : (
                            <div className="text-sm text-red-500 flex items-center">
                              <FaExclamationTriangle className="h-3 w-3 mr-1" />
                              No phone number
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(staff.status)}
                        <span className={`ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(staff.status)}`}>
                          {staff.status?.toUpperCase() || 'STAFF'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <FaCalendarAlt className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(staff.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        staff.isActive === false 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {staff.isActive === false ? 'INACTIVE' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(staff)}
                          disabled={isSubmitting}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(staff)}
                          disabled={isSubmitting}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FaUsers className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No users found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchKey ? 'Try a different search term' : 'Add your first staff member to get started'}
                      </p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        + Add Admin
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer */}
        {filteredStaff.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Relief Operation Team • Sri Lanka Disaster Management
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Help Center:</span>
              <a href="tel:+94110000000" className="text-blue-600 hover:text-blue-800 font-medium">
                +94 11 000 0000
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Sri Lanka Relief Notice */}
      <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start">
          <AlertCircle className="h-8 w-8 text-red-600 mr-4 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-red-800 mb-2">
              Sri Lanka Flood Relief Operation
            </h3>
            <p className="text-red-700 mb-3">
              All admins are currently deployed for emergency relief operations. 
              Contact numbers must be active 24/7. Emergency protocols are in effect.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="text-sm text-red-600 hover:text-red-800 font-medium">
                Emergency Contact List →
              </a>
              <a href="#" className="text-sm text-red-600 hover:text-red-800 font-medium">
                Relief Operation Protocol →
              </a>
              <a href="#" className="text-sm text-red-600 hover:text-red-800 font-medium">
                Disaster Management Guidelines →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Add Relief Staff
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      All fields are required except password
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleAddStaff}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 ${
                          errors.name 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        } ${isSubmitting ? 'bg-gray-50' : ''}`}
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: '' });
                        }}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 ${
                          errors.email 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        } ${isSubmitting ? 'bg-gray-50' : ''}`}
                        placeholder="staff@relief.lk"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                        <span className="text-xs text-gray-500 ml-2">(10 digits, starts with 0)</span>
                      </label>
                      <input
                        type="tel"
                        required
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 ${
                          errors.tp 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        } ${isSubmitting ? 'bg-gray-50' : ''}`}
                        placeholder="0771234567"
                        value={formData.tp}
                        onChange={(e) => {
                          setFormData({ ...formData, tp: e.target.value });
                          if (errors.tp) setErrors({ ...errors, tp: '' });
                        }}
                      />
                      {errors.tp && (
                        <p className="mt-1 text-sm text-red-600">{errors.tp}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 ${
                          errors.password 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        } ${isSubmitting ? 'bg-gray-50' : ''}`}
                        placeholder="Minimum 6 characters"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          if (errors.password) setErrors({ ...errors, password: '' });
                        }}
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>
                    
                    
                  </div>
                  
                  <div className="mt-8 flex space-x-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                        isSubmitting 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Adding...
                        </div>
                      ) : (
                        'Add Staff Member'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      disabled={isSubmitting}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Edit Staff
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      ID: {selectedStaff._id?.slice(-6)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleEditStaff}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 ${
                          errors.name 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        } ${isSubmitting ? 'bg-gray-50' : ''}`}
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: '' });
                        }}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 ${
                          errors.email 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        } ${isSubmitting ? 'bg-gray-50' : ''}`}
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                        <span className="text-xs text-gray-500 ml-2">(10 digits, starts with 0)</span>
                      </label>
                      <input
                        type="tel"
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 ${
                          errors.tp 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        } ${isSubmitting ? 'bg-gray-50' : ''}`}
                        placeholder="0771234567"
                        value={formData.tp}
                        onChange={(e) => {
                          setFormData({ ...formData, tp: e.target.value });
                          if (errors.tp) setErrors({ ...errors, tp: '' });
                        }}
                      />
                      {errors.tp && (
                        <p className="mt-1 text-sm text-red-600">{errors.tp}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                        <span className="text-xs text-gray-500 ml-2">(leave blank to keep current)</span>
                      </label>
                      <input
                        type="password"
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 ${
                          errors.password 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        } ${isSubmitting ? 'bg-gray-50' : ''}`}
                        placeholder="Leave blank to keep current"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          if (errors.password) setErrors({ ...errors, password: '' });
                        }}
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-8 flex space-x-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                        isSubmitting 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Updating...
                        </div>
                      ) : (
                        'Update Staff'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      disabled={isSubmitting}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStaff && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-8">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <Trash2 className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Remove Staff Member
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to remove <span className="font-semibold text-gray-900">{selectedStaff.name}</span> from the relief team? This action cannot be undone.
                  </p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                    <p className="text-sm text-red-700">
                      <strong>Important:</strong> This staff member may be actively involved in relief operations. Ensure proper handover before removal.
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={confirmDelete}
                    disabled={isSubmitting}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      isSubmitting 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </div>
                    ) : (
                      'Yes, Remove Staff'
                    )}
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStaff;