import { Search, Edit, Trash2, Plus, AlertCircle, UserCheck, Shield, Phone, Menu, X } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      showToast(`Loaded ${filteredArray.length} admin members`, 'success');
    } catch (error) {
      console.error("Error fetching staff:", error);
      showToast("Failed to load admin members", 'error');
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
      showToast(`No admin members found for "${searchTerm}"`, 'warning');
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
        throw new Error(data.message || data.error || "Failed to add admin");
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
      
      showToast("Admin member added successfully!", 'success');
    } catch (error) {
      console.error("Add admin error:", error);
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
        showToast("Admin ID not found", 'error');
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
        throw new Error(data.message || data.error || "Failed to update admin");
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
      
      showToast("Admin updated successfully!", 'success');
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
      showToast("No admin member selected for deletion.", 'error');
      return;
    }

    const staffId = selectedStaff._id;
    if (!staffId) {
      showToast("Cannot delete: Admin ID not found.", 'error');
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
        throw new Error(data.message || data.error || "Failed to delete admin");
      }

      // Update state
      const updatedStaff = staffMembers.filter(s => s._id !== staffId);
      const updatedFilteredStaff = filteredStaff.filter(s => s._id !== staffId);

      setStaffMembers(updatedStaff);
      setFilteredStaff(updatedFilteredStaff);
      setShowDeleteModal(false);
      setSelectedStaff(null);
      
      showToast(data.message || "Admin member deleted successfully!", 'success');
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pt-20 md:pt-24 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-gray-600 text-center">Loading admin members...</p>
      </div>
    );
  }

  // Stats card component
  const StatsCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <div className={`bg-white rounded-xl shadow-lg p-4 md:p-6 border-l-4 ${color} transition-transform hover:scale-105`}>
      <div className="flex items-center">
        <div className={`p-2 md:p-3 rounded-full bg-opacity-20 mr-3 md:mr-4 ${color.replace('border-', 'bg-')}`}>
          <Icon className="text-lg md:text-2xl" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs md:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-lg md:text-2xl font-bold mt-1 truncate">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1 truncate hidden md:block">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-3 md:p-4 pb-20 md:pb-4">
      <ToastContainer />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/20"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">Admin Management</h1>
              <p className="text-xs opacity-80 truncate">{filteredStaff.length} Active Admins</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Hero Section with Sri Lanka Theme */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-xl mb-4 md:mb-6 mt-16 md:mt-0" style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #065f46 100%)'
      }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-52 bg-blue-300 rounded-full -translate-x-32 -translate-y-20"></div>
          <div className="absolute bottom-0 right-0 w-64 h-52 bg-green-300 rounded-full translate-x-32 translate-y-20"></div>
        </div>
        
        <div className="relative z-10 p-4 md:p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">Admin Management</h1>
              <p className="text-blue-100 text-sm md:text-lg">
                Managing relief operation team for Sri Lanka flood relief
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2 self-start md:self-auto">
              <FaUsers className="text-lg md:text-xl flex-shrink-0" />
              <span className="font-semibold text-sm md:text-base">{filteredStaff.length} Active Admins</span>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <nav className="mt-4 md:mt-6">
            <ol className="flex flex-wrap items-center space-x-2 text-xs md:text-sm">
              <li className="flex items-center">
                <a href="/" className="hover:text-blue-200 flex items-center">
                  <FaHome className="mr-1 md:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">Home</span>
                </a>
              </li>
              <li className="text-blue-300">/</li>
              <li className="text-gray-300">Dashboard</li>
              <li className="text-gray-300">/</li>
              <li className="font-semibold truncate">Admin Management</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
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
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="w-full md:w-2/3">
            <div className="relative">
              <input
                type="text"
                className="w-full pl-10 md:pl-12 pr-10 py-2 md:py-3 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm md:text-base"
                placeholder="Search by name, email, or phone..."
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
              />
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
              {searchKey && (
                <button
                  onClick={() => setSearchKey("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            disabled={isSubmitting}
            className={`w-full md:w-auto bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg transition-all ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-green-700 hover:scale-105 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-t-2 border-b-2 border-white mr-2"></div>
                <span className="text-sm md:text-base">Processing...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                <span className="text-sm md:text-base">Add New Admin</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">Admins</h2>
            <div className="flex items-center space-x-3 md:space-x-4">
              <span className="text-xs md:text-sm text-gray-600">
                Showing {filteredStaff.length} of {staffMembers.length}
              </span>
              <button
                onClick={fetchStaff}
                disabled={isSubmitting}
                className="text-xs md:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center disabled:opacity-50"
              >
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">↻</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Admin ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Name & Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                  Joined Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff, index) => (
                  <tr 
                    key={staff._id} 
                    className="hover:bg-blue-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-xs md:text-sm font-medium text-gray-900">
                        SL{String(index + 1).padStart(3, '0')}
                      </div>
                      <div className="text-xs text-gray-500 hidden md:block truncate max-w-[100px]">
                        ID: {staff._id?.slice(-6)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center min-w-0">
                        <div className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">
                          {staff.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div className="ml-3 md:ml-4 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {staff.name}
                          </div>
                          <div className="text-xs md:text-sm text-gray-500 flex items-center mt-1 truncate">
                            <FaEnvelope className="h-3 w-3 mr-1 flex-shrink-0 hidden sm:inline" />
                            <span className="truncate">{staff.email}</span>
                          </div>
                          {staff.tp ? (
                            <div className="text-xs md:text-sm text-gray-500 flex items-center mt-1 truncate">
                              <FaPhone className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="hidden sm:inline truncate">{staff.tp}</span>
                              <span className="sm:hidden truncate">{staff.tp.substring(0, 5)}...</span>
                            </div>
                          ) : (
                            <div className="text-xs text-red-500 flex items-center mt-1 truncate">
                              <FaExclamationTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="hidden sm:inline">No phone</span>
                              <span className="sm:hidden">No phone</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center">
                        {getStatusIcon(staff.status)}
                        <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full truncate ${getStatusColor(staff.status)}`}>
                          {staff.status?.toUpperCase() || 'STAFF'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                      <div className="flex items-center">
                        <FaCalendarAlt className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{formatDate(staff.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        staff.isActive === false 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {staff.isActive === false ? 'INACTIVE' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(staff)}
                          disabled={isSubmitting}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 md:px-3 md:py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          title="Edit"
                        >
                          <Edit className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="hidden md:inline ml-1">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(staff)}
                          disabled={isSubmitting}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 md:px-3 md:py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="hidden md:inline ml-1">Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 md:px-6 py-8 md:py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-gray-100 flex items-center justify-center mb-3 md:mb-4">
                        <FaUsers className="h-8 w-8 md:h-12 md:w-12 text-gray-400" />
                      </div>
                      <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                        No users found
                      </h3>
                      <p className="text-gray-500 text-sm md:text-base mb-3 md:mb-4 text-center max-w-md">
                        {searchKey ? `No admin members found for "${searchKey}"` : 'Add your first admin member to get started'}
                      </p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm md:text-base"
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
          <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="text-xs md:text-sm text-gray-500 text-center sm:text-left">
              Relief Operation Team • Sri Lanka Disaster Management
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs md:text-sm text-gray-500 hidden sm:inline">Help Center:</span>
              <a href="tel:+94110000000" className="text-blue-600 hover:text-blue-800 font-medium text-xs md:text-sm whitespace-nowrap">
                +94 11 000 0000
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Sri Lanka Relief Notice */}
      <div className="mt-6 md:mt-8 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-red-600 mr-3 md:mr-4 flex-shrink-0 mt-1" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base md:text-lg font-bold text-red-800 mb-1 md:mb-2">
              Sri Lanka Flood Relief Operation
            </h3>
            <p className="text-red-700 text-sm md:text-base mb-2 md:mb-3">
              All admins are currently deployed for emergency relief operations. 
              Contact numbers must be active 24/7. Emergency protocols are in effect.
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 md:gap-4">
              <a href="#" className="text-xs md:text-sm text-red-600 hover:text-red-800 font-medium truncate">
                Emergency Contact List →
              </a>
              <a href="#" className="text-xs md:text-sm text-red-600 hover:text-red-800 font-medium truncate">
                Relief Operation Protocol →
              </a>
              <a href="#" className="text-xs md:text-sm text-red-600 hover:text-red-800 font-medium truncate">
                Disaster Management Guidelines →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-3 md:p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => !isSubmitting && setShowAddModal(false)} />
            <div className="relative bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-full md:max-w-md w-full mx-auto">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="min-w-0 flex-1 mr-4">
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                      Add Admin
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">
                      All fields are required
                    </p>
                  </div>
                  <button
                    onClick={() => !isSubmitting && setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    disabled={isSubmitting}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleAddStaff}>
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 text-sm md:text-base ${
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
                        <p className="mt-1 text-xs md:text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        disabled={isSubmitting}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 text-sm md:text-base ${
                          errors.email 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        } ${isSubmitting ? 'bg-gray-50' : ''}`}
                        placeholder="admin@relief.lk"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs md:text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Phone Number *
                        <span className="text-xs text-gray-500 ml-1 md:ml-2">(10 digits, starts with 0)</span>
                      </label>
                      <input
                        type="tel"
                        required
                        disabled={isSubmitting}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 text-sm md:text-base ${
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
                        <p className="mt-1 text-xs md:text-sm text-red-600">{errors.tp}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        disabled={isSubmitting}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 text-sm md:text-base ${
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
                        <p className="mt-1 text-xs md:text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 md:mt-8 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 md:space-x-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-base ${
                        isSubmitting 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 active:scale-95'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          <span>Adding...</span>
                        </div>
                      ) : (
                        'Add Admin'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      disabled={isSubmitting}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
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
          <div className="flex items-center justify-center min-h-screen p-3 md:p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => !isSubmitting && setShowEditModal(false)} />
            <div className="relative bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-full md:max-w-md w-full mx-auto">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="min-w-0 flex-1 mr-4">
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                      Edit Admin
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">
                      ID: {selectedStaff._id?.slice(-6)}
                    </p>
                  </div>
                  <button
                    onClick={() => !isSubmitting && setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    disabled={isSubmitting}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleEditStaff}>
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 text-sm md:text-base ${
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
                        <p className="mt-1 text-xs md:text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        disabled={isSubmitting}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 text-sm md:text-base ${
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
                        <p className="mt-1 text-xs md:text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Phone Number
                        <span className="text-xs text-gray-500 ml-1 md:ml-2">(10 digits, starts with 0)</span>
                      </label>
                      <input
                        type="tel"
                        disabled={isSubmitting}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 text-sm md:text-base ${
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
                        <p className="mt-1 text-xs md:text-sm text-red-600">{errors.tp}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        New Password
                        <span className="text-xs text-gray-500 ml-1 md:ml-2">(leave blank to keep current)</span>
                      </label>
                      <input
                        type="password"
                        disabled={isSubmitting}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 text-sm md:text-base ${
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
                        <p className="mt-1 text-xs md:text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 md:mt-8 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 md:space-x-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-base ${
                        isSubmitting 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 active:scale-95'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          <span>Updating...</span>
                        </div>
                      ) : (
                        'Update Admin'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      disabled={isSubmitting}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
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
          <div className="flex items-center justify-center min-h-screen p-3 md:p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => !isSubmitting && setShowDeleteModal(false)} />
            <div className="relative bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-full md:max-w-md w-full mx-auto">
              <div className="p-4 md:p-8">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-full bg-red-100 mb-3 md:mb-4">
                    <Trash2 className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                    Remove Admin
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
                    Are you sure you want to remove <span className="font-semibold text-gray-900 truncate">{selectedStaff.name}</span> from the relief team? This action cannot be undone.
                  </p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg md:rounded-xl p-3 md:p-4 mb-4 md:mb-6">
                  <div className="flex">
                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600 mr-2 md:mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-xs md:text-sm text-red-700">
                      <strong>Important:</strong> This admin may be actively involved in relief operations. Ensure proper handover before removal.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 md:space-x-3">
                  <button
                    onClick={confirmDelete}
                    disabled={isSubmitting}
                    className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-base ${
                      isSubmitting 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 active:scale-95'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        <span>Deleting...</span>
                      </div>
                    ) : (
                      'Yes, Remove'
                    )}
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
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