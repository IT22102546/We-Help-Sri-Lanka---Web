import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Button, Modal, Form, Alert, Spinner } from "react-bootstrap";
import {
  FaTrash,
  FaEdit,
  FaHome,
  FaSearch,
  FaSpinner,
  FaKey,
  FaImage,
  FaEye, 
  FaEyeSlash,
   FaTimes
} from "react-icons/fa";
import { Search } from "lucide-react";
import ImageCropper from "../../Components/ImageCropper"; // Make sure this path is correct

function AdminProfiles() {
  const [originalProfiles, setOriginalProfiles] = useState([]); 
  const [profiles, setProfiles] = useState([]); 
  const [searchKey, setSearchKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageType, setImageType] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Image cropping states
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [croppingFor, setCroppingFor] = useState('');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState(null);
  // Add state for profile image viewer
const [showProfileImageViewer, setShowProfileImageViewer] = useState(false);
const [currentProfileImage, setCurrentProfileImage] = useState('');

  const fileInputRef = useRef(null);

  // Fetch profiles data
   useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/profiles", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profiles");
        }

        const data = await response.json();
        setProfiles(data);
        setOriginalProfiles(data); 
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

   const getImageUrl = (path) => {
    if (!path) return "/default-profile.jpg";
    
    const urls = [
      `https://api.viwahaa.com/uploads/${path}`,
      `https://mobile.viwahaa.com/uploads/${path}`
    ];
    
    return urls[0];
  };

  // Handle profile image click to open viewer
  const handleProfileImageClick = (profile) => {
    if (profile.profile_img) {
      setCurrentProfileImage(profile.profile_img);
      setShowProfileImageViewer(true);
    }
  };

// Add this function to handle image loading errors
const handleImageError = (e, imagePath, type = 'profile') => {
  console.log(`${type} image failed to load:`, imagePath);
  if (e.target.src.includes('api.viwahaa.com')) {
    e.target.src = `https://mobile.viwahaa.com/uploads/${imagePath}`;
  } else {
    e.target.src = "https://via.placeholder.com/150";
  }
};

  // Check user type from localStorage
 useEffect(() => {
    const checkUserType = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserType(parsedUser.user_type_id);
        } else if (localStorage.getItem('isStaff') === 'true') {
          setUserType(3); // Staff user_type_id
        } else if (localStorage.getItem('isAdmin') === 'true') {
          setUserType(1); // Admin user_type_id
        } else {
          const userTypeId = localStorage.getItem('userTypeId');
          if (userTypeId) {
            setUserType(parseInt(userTypeId));
          }
        }
      } catch (error) {
        console.error("Error checking user type:", error);
      }
    };

    checkUserType();
  }, []);

  const isStaff = userType === 3;
  const isAdmin = userType === 1;


  // Search function - FIXED VERSION
  const handleSearch = () => {
    if (!searchKey.trim()) {
      // If search is empty, show all original profiles
      setProfiles(originalProfiles);
      return;
    }

    const searchTerm = searchKey.toLowerCase().trim();
    
    // Helper function to normalize member IDs for search (remove leading zeros after the letter)
    const normalizeMemberId = (memberId) => {
      if (!memberId) return '';
      
      // For IDs like "V002394" - remove zeros after the letter but keep the letter
      const match = memberId.match(/^([A-Za-z]+)(0*)(\d+)$/);
      if (match) {
        const [, letterPart, zeros, numberPart] = match;
        return letterPart.toLowerCase() + numberPart;
      }
      
      return memberId.toLowerCase();
    };

    const searchTermNormalized = normalizeMemberId(searchTerm);
    
    // Search in originalProfiles instead of current profiles
    const filtered = originalProfiles.filter(profile => {
      // Normalize the member ID for comparison
      const normalizedMemberId = normalizeMemberId(profile.member_id);
      
      // Check all searchable fields
      return (
        // Original member ID match
        (profile.member_id && profile.member_id.toLowerCase().includes(searchTerm)) ||
        // Normalized member ID match (without zeros)
        (normalizedMemberId && normalizedMemberId.includes(searchTermNormalized)) ||
        // Other fields
        (profile.first_name && profile.first_name.toLowerCase().includes(searchTerm)) ||
        (profile.last_name && profile.last_name.toLowerCase().includes(searchTerm)) ||
        (`${profile.first_name} ${profile.last_name}`.toLowerCase().includes(searchTerm)) ||
        (profile.email && profile.email.toLowerCase().includes(searchTerm)) ||
        (profile.contact_no && profile.contact_no.includes(searchTerm)) ||
        (profile.whatsapp_no && profile.whatsapp_no.includes(searchTerm)) ||
        (profile.status && profile.status.toLowerCase().includes(searchTerm))
      );
    });
    
    setProfiles(filtered);
  };

  // Search input handler
  const handleSearchChange = (e) => {
    setSearchKey(e.target.value);
  };

  // Clear search handler
  const handleClearSearch = () => {
    setSearchKey("");
    setProfiles(originalProfiles);
  };

  // Handle Enter key in search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Rest of your functions...
  const handleImageUpload = (type) => {
    setImageType(type);
    setShowImageModal(true);
  };

const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if it's an image file that should be cropped
      // Only crop profile_img, not img_1 or img_2
      if (imageType === 'profile_img' && file.type.startsWith('image/')) {
        // Show cropper only for profile_img
        const imageUrl = URL.createObjectURL(file);
        setImageToCrop(imageUrl);
        setCroppingFor(imageType);
        setShowCropper(true);
        setShowImageModal(false); // Close the file selection modal
      } else {
        // For non-image files, chart_img, img_1, and img_2 - set directly without cropping
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

    const handleCropComplete = async (croppedImageBlob) => {
    try {
      setLoading(true);
      
      // Create a file from the cropped blob
      const croppedFile = new File([croppedImageBlob], `cropped-${croppingFor}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      // Create FormData for upload
      const formData = new FormData();
      formData.append('image', croppedFile);
      formData.append('type', croppingFor);

      // Upload the cropped image
      const response = await fetch(
        `/api/admin/profiles/${selectedProfile.id}/images`,
        {
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();

      // Update both original and displayed profiles
      const updatedProfiles = originalProfiles.map(p => 
        p.id === selectedProfile.id ? { ...p, [croppingFor]: data.imageUrl } : p
      );
      setOriginalProfiles(updatedProfiles);
      setProfiles(updatedProfiles);

      // Close modal and reset
      setShowCropper(false);
      setImageToCrop(null);
      setCroppingFor('');
      setError('');

      // Revoke the object URL to avoid memory leaks
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop);
      }
    } catch (err) {
      console.error("Image upload error:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
    setCroppingFor('');
    
    // Revoke the object URL
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
    }
    
    // Reopen the file selection modal
    setShowImageModal(true);
  };

const uploadImage = async () => {
    if (!imageFile || !selectedProfile) return;

    try {
      setLoading(true);
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('type', imageType);

      // Upload the image
      const response = await fetch(
        `/api/admin/profiles/${selectedProfile.id}/images`,
        {
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();

      // Update both original and displayed profiles
      const updatedProfiles = originalProfiles.map(p => 
        p.id === selectedProfile.id ? { ...p, [imageType]: data.imageUrl } : p
      );
      setOriginalProfiles(updatedProfiles);
      setProfiles(updatedProfiles);

      // Close modal and reset
      setShowImageModal(false);
      setImageFile(null);
      setImagePreview('');
      setError('');
    } catch (err) {
      console.error("Image upload error:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };
  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/profiles/${selectedProfile.id}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update password");
      }

      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete functions
  const handleDeleteClick = (profile) => {
    setSelectedProfile(profile);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `/api/admin/profiles/${selectedProfile.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete profile");
      }
  
      // Update both original and displayed profiles
      const updatedProfiles = originalProfiles.filter((p) => p.id !== selectedProfile.id);
      setOriginalProfiles(updatedProfiles);
      setProfiles(updatedProfiles);
      
      setShowDeleteModal(false);
      setError("");
    } catch (err) {
      setError(err.message);
      console.error("Delete error:", err);
    }
  };

  // Status change functions
  const handleStatusChange = async (profileId, newStatus) => {
    try {
      // Update both original and displayed profiles
      const updatedOriginal = originalProfiles.map(profile => 
        profile.id === profileId 
          ? { ...profile, status: newStatus }
          : profile
      );
      
      const updatedDisplayed = profiles.map(profile => 
        profile.id === profileId 
          ? { ...profile, status: newStatus }
          : profile
      );

      setOriginalProfiles(updatedOriginal);
      setProfiles(updatedDisplayed);

      // Send API request to update backend
      const response = await fetch(
        `/api/admin/profiles/${profileId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert both if API fails
      const revertedOriginal = originalProfiles.map(profile => 
        profile.id === profileId 
          ? { 
              ...profile, 
              status: profile.status === "single" ? "fixed" : "single" 
            }
          : profile
      );
      
      const revertedDisplayed = profiles.map(profile => 
        profile.id === profileId 
          ? { 
              ...profile, 
              status: profile.status === "single" ? "fixed" : "single" 
            }
          : profile
      );

      setOriginalProfiles(revertedOriginal);
      setProfiles(revertedDisplayed);
      setError(error.message);
    }
  };

  // View profile
  const handleViewClick = async (profile) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/profiles/${profile.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch profile details");
      }
  
      const data = await response.json();
      setSelectedProfile(data);
      setShowViewModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  // Edit profile
  const handleEditClick = async (profile) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/profiles/${profile.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile details");
      }

      const data = await response.json();
      setSelectedProfile(data);
      
      // Format the data for the form
      setFormData({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        contact_no: data.contact_no,
        whatsapp_no: data.whatsapp_no,
        d_o_b: data.d_o_b ? formatDateForInput(data.d_o_b) : '',
        age: data.age,
        gender:data.gender,
        birth_place: data.birth_place,
        address: data.address,
        birth_time: data.birth_time,
        maritial_status: data.maritial_status,
        height: data.height,
        weight: data.weight,
        complexion: data.complexion,
        physical_status: data.physical_status,
        cast: data.cast,
        religion: data.religion,
        star_sign: data.star_sign,
        family_value: data.family_value,
        family_type: data.family_type,
        family_status: data.family_status,
        fathers_name: data.fathers_name,
        fathers_occupation: data.fathers_occupation,
        fathers_native_place: data.fathers_native_place,
        mothers_name: data.mothers_name,
        mothers_occupation: data.mothers_occupation,
        mothers_native_place: data.mothers_native_place ,
        brothers: data.brothers,
        married_brothers: data.married_brothers ,
        sisters: data.sisters,
        married_sisters: data.married_sisters ,
        more_family: data.more_family,
        country_of_birth: data.country_of_birth,
        city_of_birth: data.city_of_birth,
        country_of_resident: data.country_of_resident,
        city_of_resident: data.city_of_resident,
        country_of_citizenship: data.country_of_citizenship,
        eating_habit: data.eating_habit,
        smoking_habit: data.smoking_habit,
        drinking_habit: data.drinking_habit,
        primary_school: data.primary_school,
        secondary_school: data.secondary_school,
        education: data.education,
        occupation: data.occupation,
        occupation_details:data.occupation_details,
        annual_income: data.annual_income,
        partner_country_of_resident: data.partner_country_of_resident,
        partner_resident_status: data.partner_resident_status,
        partner_education: data.partner_education,
        partner_occupation: data.partner_occupation,
        partner_annual_income: data.partner_annual_income,
        partner_marital_status: data.partner_marital_status,
        partner_minimum_age: data.partner_minimum_age,
        partner_maximum_age: data.partner_maximum_age,
        partner_minimum_height: data.partner_minimum_height,
        partner_maximum_height: data.partner_maximum_height,
        partner_physical_status: data.partner_physical_status,
        partner_mother_tongue: data.partner_mother_tongue,
        partner_religion: data.partner_religion,
        partner_star_sign: data.partner_star_sign,
        partner_cast: data.partner_cast,
        partner_eating_habit: data.partner_eating_habit,
        partner_smoking_habit: data.partner_smoking_habit,
        partner_drinking_habit: data.partner_drinking_habit,
        status: data.status
      });
      
      setShowEditModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
  
    try {
      const dataToSend = { ...formData };
      
      if (!dataToSend.d_o_b) {
        delete dataToSend.d_o_b;
      }
  
      const response = await fetch(`/api/admin/profiles/${selectedProfile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(dataToSend),
      });
  
      if (!response.ok) throw new Error("Failed to update profile");
  
      const data = await response.json();
      
      // Update both original and displayed profiles
      const updatedProfiles = originalProfiles.map(p => 
        p.id === selectedProfile.id ? { ...p, ...dataToSend } : p
      );
      setOriginalProfiles(updatedProfiles);
      setProfiles(updatedProfiles);
      
      // Close the modal
      setShowEditModal(false);
      
      // Clear any errors
      setError("");
    } catch (err) {
      setError(err.message);
      console.error("Update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
            {/* Breadcrumb */}
      <div className="card mb-4 shadow-lg rounded-lg mt-12">
        <div className="card-body p-6 bg-white rounded-lg">
          <h5 className="text-xl font-semibold text-gray-800 mb-3">Profiles</h5>

          <nav aria-label="breadcrumb">
            <ol className="breadcrumb flex items-center space-x-3 text-sm text-gray-600">
              <li className="breadcrumb-item flex items-center">
                <Link
                  to="/admin/dashboard"
                  className="hover:text-blue-600 flex items-center"
                >
                  <FaHome className="mr-1 text-lg" />
                  Dashboard
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="#" className="hover:text-blue-600">
                  Profiles
                </Link>
              </li>
              <li
                className="breadcrumb-item active text-gray-900"
                aria-current="page"
              >
                Profiles
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Search Bar - UPDATED */}
      <div className="flex justify-center mb-4 w-full">
        <div className="relative w-full max-w-lg">
          <input
            type="text"
            className="w-full pl-4 pr-20 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by name, email, member ID, phone, status..."
            value={searchKey}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
            {searchKey && (
              <button
                onClick={handleClearSearch}
                className="bg-gray-300 text-gray-700 p-1 rounded-full hover:bg-gray-400 focus:outline-none"
                title="Clear search"
              >
                ×
              </button>
            )}
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {searchKey && (
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">
            Showing {profiles.length} of {originalProfiles.length} profiles
            {searchKey && ` for "${searchKey}"`}
          </p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {/* Profiles Table */}
      <div className="card">
        <div className="card-header p-4">
         
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <div className="overflow-x-auto bg-white shadow rounded-lg">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium font-workSans text-gray-700">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium font-workSans text-gray-700">
                      Member ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium font-workSans text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium font-workSans text-gray-700">
                      Email
                    </th>
                    {!isStaff && (
                      <th className="px-4 py-3 text-left text-sm font-medium font-workSans text-gray-700">
                        Number
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-sm font-medium font-workSans text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium font-workSans text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {profiles.map((profile, index) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">{profile.member_id}</td>
                      <td className="px-4 py-3">
                        {profile.first_name} {profile.last_name}
                      </td>
                      <td className="px-4 py-3">{profile.email}</td>
                      {!isStaff && (
                      <td className="px-4 py-3">{profile.contact_no}</td>   )}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleStatusChange(profile.id, profile.status === "single" ? "fixed" : "single")}
                          className={`px-4 py-1 text-white rounded-full ${
                            profile.status === "single" ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          {profile.status === "single" ? "Single" : "Fixed"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            className="px-2 py-1 text-white bg-orange-400 rounded-full"
                            onClick={() => handleViewClick(profile)}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="px-2 py-1 text-white bg-yellow-400 rounded-full"
                            onClick={() => handleEditClick(profile)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="px-2 py-1 text-white bg-red-600 rounded-full"
                            onClick={() => handleDeleteClick(profile)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* No Results Message */}
      {profiles.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">
            {searchKey ? 'No profiles found matching your search.' : 'No profiles available.'}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Background overlay with click-to-close */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowDeleteModal(false)}
          ></div>

          {/* Modal container */}
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Modal content */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              {/* Header with close button */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-red-600">
                    Warning!
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body content */}
              <div className="px-4 py-5 sm:p-6">
                <p className="text-center">
                  If you want to remove this data, <b>you can't undo</b>, It
                  will affect the relevant records!
                </p>
              </div>

              {/* Footer with action buttons */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                {/* Yes (Danger) Button */}
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Yes
                </button>

                {/* No (Secondary) Button */}
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}




      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowStatusModal(false)}
          ></div>

          {/* Modal container */}
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Modal content */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Header */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-red-600">
                    Change Status
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setShowStatusModal(false)}
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Plan
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                  >
                    <option value="">Select Plan</option>
                    <option value="single">Single</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                <button
                  type="button"
                  onClick={saveStatusChange}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Image Viewer Modal */}
   {showProfileImageViewer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="relative max-w-4xl max-h-full w-full flex items-center justify-center">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3"
              onClick={() => setShowProfileImageViewer(false)}
            >
              <FaTimes className="text-2xl" />
            </button>
            
            {/* Image Container */}
            <div className="relative max-w-full max-h-full">
              <img
                src={`https://api.viwahaa.com/uploads/${currentProfileImage}`}
                alt="Profile"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://mobile.viwahaa.com/uploads/${currentProfileImage}`;
                }}
              />
            </div>
            
            {/* Download Button */}
           
          </div>
        </div>
      )}
      {/* View Profile Modal */}
{showViewModal && selectedProfile && (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    {/* Background overlay */}
    <div
      className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      onClick={() => setShowViewModal(false)}
    ></div>

    {/* Modal container */}
    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="ml-2 text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={() => setShowViewModal(false)}
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex-grow">
            Client Data
          </h3>
        </div>

        {/* Body */}
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto">
            <div className="flex flex-col space-y-4">
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Customer Info */}
                <div className="w-full md:w-1/4 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <div className="flex flex-col items-center">
                    {!isStaff && (
                      <div className="relative mb-4">
                        {/* FIXED: Clean profile image with proper click handler */}
                        <div 
                          className="cursor-pointer transition-all duration-200 hover:shadow-lg rounded-full"
                          onClick={() => handleProfileImageClick(selectedProfile)}
                        >
                          <img
                            src={
                              selectedProfile.profile_img
                                ? `https://api.viwahaa.com/uploads/${selectedProfile.profile_img}`
                                : "https://via.placeholder.com/150"
                            }
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
                            alt="Profile"
                            onError={(e) => {
                              e.target.onerror = null;
                              if (e.target.src.includes('api.viwahaa.com')) {
                                e.target.src = `https://mobile.viwahaa.com/uploads/${selectedProfile.profile_img}`;
                              } else {
                                e.target.src = "https://via.placeholder.com/150";
                              }
                            }}
                          />
                        </div>
                        {/* Click hint text */}
                        <p className="text-xs text-gray-500 text-center mt-2">
                          Click image to view full size
                        </p>
                      </div>
                    )}
                    
                    <h2 className="text-xl font-semibold text-gray-800">
                      {selectedProfile.first_name} {selectedProfile.last_name}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {selectedProfile.email}
                    </p>

                    <div className="w-full mt-4 space-y-2 text-sm">
                      <p className="flex justify-between">
                        <span className="text-gray-500">Date of Birth:</span>
                        <span className="text-gray-800">
                          {selectedProfile.d_o_b || "N/A"}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-500">Age:</span>
                        <span className="text-gray-800">
                          {selectedProfile.age || "N/A"}
                        </span>
                      </p>
                    </div>

                    {/* Chart and Image buttons */}
                    <div className="grid grid-cols-3 gap-2 w-full mt-4">
                      {/* Chart Button */}
                      <button
                        onClick={async () => {
                          if (selectedProfile.chart_img) {
                            const url1 = `https://api.viwahaa.com/uploads/${selectedProfile.chart_img}`;
                            try {
                              const response = await fetch(url1, { method: 'HEAD' });
                              if (response.ok) {
                                window.open(url1, '_blank');
                                return;
                              }
                            } catch (error) {
                              console.log('First URL failed, trying backup');
                            }

                            const url2 = `https://mobile.viwahaa.com/uploads/${selectedProfile.chart_img}`;
                            try {
                              const response = await fetch(url2, { method: 'HEAD' });
                              if (response.ok) {
                                window.open(url2, '_blank');
                                return;
                              }
                            } catch (error) {
                              console.log('Both URLs failed');
                            }
                            alert('Chart image could not be loaded from either server');
                          }
                        }}
                        className={`py-1 px-2 rounded text-xs flex items-center justify-center ${
                          selectedProfile.chart_img 
                            ? "bg-gray-100 hover:bg-gray-200 text-gray-800" 
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!selectedProfile.chart_img}
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        {selectedProfile.chart_img ? "Chart" : "No Chart"}
                      </button>

                      {/* IMG 1 Button */}
                      {!isStaff && (
                        <button
                          onClick={async () => {
                            if (selectedProfile.img_1) {
                              const url1 = `https://api.viwahaa.com/uploads/${selectedProfile.img_1}`;
                              try {
                                const response = await fetch(url1, { method: 'HEAD' });
                                if (response.ok) {
                                  window.open(url1, '_blank');
                                  return;
                                }
                              } catch (error) {
                                console.log('First URL failed, trying backup');
                              }

                              const url2 = `https://mobile.viwahaa.com/uploads/${selectedProfile.img_1}`;
                              try {
                                const response = await fetch(url2, { method: 'HEAD' });
                                if (response.ok) {
                                  window.open(url2, '_blank');
                                  return;
                                }
                              } catch (error) {
                                console.log('Both URLs failed');
                              }
                              alert('Image 1 could not be loaded from either server');
                            }
                          }}
                          className={`py-1 px-2 rounded text-xs flex items-center justify-center ${
                            selectedProfile.img_1 
                              ? "bg-gray-100 hover:bg-gray-200 text-gray-800" 
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!selectedProfile.img_1}
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                          {selectedProfile.img_1 ? "IMG 1" : "No Image"}
                        </button>
                      )}

                      {/* IMG 2 Button */}
                      {!isStaff && (
                        <button
                          onClick={async () => {
                            if (selectedProfile.img_2) {
                              const url1 = `https://api.viwahaa.com/uploads/${selectedProfile.img_2}`;
                              try {
                                const response = await fetch(url1, { method: 'HEAD' });
                                if (response.ok) {
                                  window.open(url1, '_blank');
                                  return;
                                }
                              } catch (error) {
                                console.log('First URL failed, trying backup');
                              }

                              const url2 = `https://mobile.viwahaa.com/uploads/${selectedProfile.img_2}`;
                              try {
                                const response = await fetch(url2, { method: 'HEAD' });
                                if (response.ok) {
                                  window.open(url2, '_blank');
                                  return;
                                }
                              } catch (error) {
                                console.log('Both URLs failed');
                              }
                              alert('Image 2 could not be loaded from either server');
                            }
                          }}
                          className={`py-1 px-2 rounded text-xs flex items-center justify-center ${
                            selectedProfile.img_2 
                              ? "bg-gray-100 hover:bg-gray-200 text-gray-800" 
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!selectedProfile.img_2}
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                          {selectedProfile.img_2 ? "IMG 2" : "No Image"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic Details */}
                <div className="w-full md:w-3/4 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                    Basic Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mobile Number - Hidden for Staff */}
                    {!isStaff && (
                      <div>
                        <p className="text-sm">
                          <span className="font-medium text-gray-500">
                            Mobile Number:
                          </span>{" "}
                          {selectedProfile.contact_no || "N/A"}
                        </p>
                      </div>
                    )}
                    
                    {/* WhatsApp Number - Always Visible */}
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-500">
                          Whatsapp No:
                        </span>{" "}
                        {selectedProfile.whatsapp_no || "N/A"}
                      </p>
                    </div>
                    
                    {/* Rest of the fields - Always Visible */}
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-500">
                          Birth Place:
                        </span>{" "}
                        {selectedProfile.birth_place || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-500">
                          Address:
                        </span>{" "}
                        {selectedProfile.address || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-500">
                          Birth Time:
                        </span>{" "}
                        {selectedProfile.birth_time || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-500">
                          Marital Status:
                        </span>{" "}
                        {selectedProfile.maritial_status || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-500">
                          Height (cm):
                        </span>{" "}
                        {selectedProfile.height || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-500">
                          Weight (Kg):
                        </span>{" "}
                        {selectedProfile.weight || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-500">
                          Complexion:
                        </span>{" "}
                        {selectedProfile.complexion || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-500">
                          Physical Status:
                        </span>{" "}
                        {selectedProfile.physical_status || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-500">
                          Caste:
                        </span>{" "}
                        {selectedProfile.cast || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-500">
                          Religion:
                        </span>{" "}
                        {selectedProfile.religion || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-500">
                          Star Sign:
                        </span>{" "}
                        {selectedProfile.star_sign || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Details */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                  Family Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Family Value:
                      </span>{" "}
                      {selectedProfile.family_value || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Family Type:
                      </span>{" "}
                      {selectedProfile.family_type || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Family Status:
                      </span>{" "}
                      {selectedProfile.family_status || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Father's Name:
                      </span>{" "}
                      {selectedProfile.fathers_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Father's Occupation:
                      </span>{" "}
                      {selectedProfile.fathers_occupation || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Father's Native Place:
                      </span>{" "}
                      {selectedProfile.fathers_native_place || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Mother's Name:
                      </span>{" "}
                      {selectedProfile.mothers_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Mother's Occupation:
                      </span>{" "}
                      {selectedProfile.mothers_occupation || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Mother's Native Place:
                      </span>{" "}
                      {selectedProfile.mothers_native_place || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Brothers:
                      </span>{" "}
                      {selectedProfile.brothers || "N/A"}
                    </p>
                  </div>
                   <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Married Brothers:
                      </span>{" "}
                      {selectedProfile.married_brothers || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Sisters:
                      </span>{" "}
                      {selectedProfile.sisters || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Married Sisters:
                      </span>{" "}
                      {selectedProfile.married_sisters || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        More Family Info:
                      </span>{" "}
                      {selectedProfile.more_family || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Partner Preference */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                  Partner Preference
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Country of Resident:
                      </span>{" "}
                      {selectedProfile.partner_country_of_resident ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Resident Status:
                      </span>{" "}
                      {selectedProfile.partner_resident_status || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Education:
                      </span>{" "}
                      {selectedProfile.partner_education || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Occupation:
                      </span>{" "}
                      {selectedProfile.partner_occupation || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Annual Income:
                      </span>{" "}
                      {selectedProfile.partner_annual_income || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Marital Status:
                      </span>{" "}
                      {selectedProfile.partner_marital_status || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Minimum Age:
                      </span>{" "}
                      {selectedProfile.partner_minimum_age || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Maximum Age:
                      </span>{" "}
                      {selectedProfile.partner_maximum_age || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Minimum Height (cm):
                      </span>{" "}
                      {selectedProfile.partner_minimum_height || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Maximum Height (cm):
                      </span>{" "}
                      {selectedProfile.partner_maximum_height || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Physical Status:
                      </span>{" "}
                      {selectedProfile.partner_physical_status || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Mother Tongue:
                      </span>{" "}
                      {selectedProfile.partner_mother_tongue || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Religion:
                      </span>{" "}
                      {selectedProfile.partner_religion || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Star Sign:
                      </span>{" "}
                      {selectedProfile.partner_star_sign || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Caste:
                      </span>{" "}
                      {selectedProfile.partner_cast || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Eating Habits:
                      </span>{" "}
                      {selectedProfile.partner_eating_habit || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Smoking Habits:
                      </span>{" "}
                      {selectedProfile.partner_smoking_habit || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Drinking Habits:
                      </span>{" "}
                      {selectedProfile.partner_drinking_habit || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Location Details */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                    Location
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Country of Birth:
                      </span>{" "}
                      {selectedProfile.country_of_birth || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        City of Birth:
                      </span>{" "}
                      {selectedProfile.city_of_birth || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Country of Resident:
                      </span>{" "}
                      {selectedProfile.country_of_resident || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        City of Resident:
                      </span>{" "}
                      {selectedProfile.city_of_resident || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Country of Citizenship:
                      </span>{" "}
                      {selectedProfile.country_of_citizenship || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Lifestyle */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                    Lifestyle
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Eating Habits:
                      </span>{" "}
                      {selectedProfile.eating_habit || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Smoking Habits:
                      </span>{" "}
                      {selectedProfile.smoking_habit || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Drinking Habits:
                      </span>{" "}
                      {selectedProfile.drinking_habit || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Education & Professional */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                    Education & Professional
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Primary School:
                      </span>{" "}
                      {selectedProfile.primary_school || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Secondary School:
                      </span>{" "}
                      {selectedProfile.secondary_school || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Education:
                      </span>{" "}
                      {selectedProfile.education || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Occupation:
                      </span>{" "}
                      {selectedProfile.occupation || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Occupation Details:
                      </span>{" "}
                      {selectedProfile.occupation_details || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-500">
                        Annual Income:
                      </span>{" "}
                      {selectedProfile.annual_income || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={() => setShowViewModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      
 {/* Edit Profile Modal - Moved outside of view modal */}
     {showEditModal && (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    {/* Overlay that only closes when no nested modals are open */}
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      onClick={() => {
        if (!showImageModal && !showPasswordModal) {
          setShowEditModal(false);
        }
      }}
    ></div>

    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div 
        className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full relative z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header flex justify-between items-center border-b pb-3 px-6 pt-5">
          <h3 className="text-xl font-normal">Update Current User Information</h3>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 text-2xl"
            onClick={() => setShowEditModal(false)}
          >
            &times;
          </button>
        </div>

        <div className="modal-body py-4 px-6">
          <form onSubmit={handleSave}>
            {/* Image and Password Action Buttons */}
            
<div className="grid grid-cols-3 gap-2 w-full mt-4">
  {/* Profile Image Button - Hidden for Staff */}
  {!isStaff && (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleImageUpload('profile_img');
      }}
      className={`py-1 px-2 rounded text-xs flex items-center justify-center ${
        selectedProfile.profile_img 
          ? "bg-green-100 hover:bg-green-200 text-green-800" 
          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
      }`}
    >
      <FaImage className="mr-1" />
      {selectedProfile.profile_img ? "Update Profile" : "Add Profile"}
    </button>
  )}
  
  {/* Chart Button - Always Visible */}
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      handleImageUpload('chart_img');
    }}
    className={`py-1 px-2 rounded text-xs flex items-center justify-center ${
      selectedProfile.chart_img 
        ? "bg-green-100 hover:bg-green-200 text-green-800" 
        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
    }`}
  >
    <FaImage className="mr-1" />
    {selectedProfile.chart_img ? "Update Chart" : "Add Chart"}
  </button>

  {/* Image 1 Button - Hidden for Staff */}
  {!isStaff && (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleImageUpload('img_1');
      }}
      className={`py-1 px-2 rounded text-xs flex items-center justify-center ${
        selectedProfile.img_1 
          ? "bg-green-100 hover:bg-green-200 text-green-800" 
          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
      }`}
    >
      <FaImage className="mr-1" />
      {selectedProfile.img_1 ? "Update Image 1" : "Add Image 1"}
    </button>
  )}

  {/* Image 2 Button - Hidden for Staff */}
  {!isStaff && (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleImageUpload('img_2');
      }}
      className={`py-1 px-2 rounded text-xs flex items-center justify-center ${
        selectedProfile.img_2
          ? "bg-green-100 hover:bg-green-200 text-green-800" 
          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
      }`}
    >
      <FaImage className="mr-1" />
      {selectedProfile.img_2 ? "Update Image 2" : "Add Image 2"}
    </button>
  )}


 
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setShowPasswordModal(true);
      }}
      className="py-1 px-2 rounded text-xs flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-800"
    >
      <FaKey className="mr-1" />
      Change Password
    </button>

</div>

            {/* All Form Fields */}
            <div className="mb-6 mt-6">
              <h6 className="text-center font-medium text-lg mb-3">Edit Basic Details</h6>
              <hr className="mb-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* First Name */}
                <div>
                  <label className="block mb-1">First Name<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="First Name"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block mb-1">Last Name<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Last Name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-1">Email<span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Email"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block mb-1">Date of Birth<span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="d_o_b"
                    value={formData.d_o_b || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                    <div>
                      <label className="block mb-1">
                        Age<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Age"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Gender<span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        
                      </select>
                    </div>
                    {!isStaff && (
                    <div>
                      <label className="block mb-1">
                        Contact No<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="contact_no"
                        value={formData.contact_no}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Contact No"
                       
                      />
                    </div>
                    )}
                    <div>
                      <label className="block mb-1">
                        Whatsapp No<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="whatsapp_no"
                        value={formData.whatsapp_no}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Whatsapp No"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-1">
                        Address<span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Address"
                        rows="3"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block mb-1">
                        Birth Place<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="birth_place"
                        value={formData.birth_place}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Birth Place"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Birth Time<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="birth_time"
                        value={formData.birth_time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Birth Time"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Height<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Height"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Weight<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Weight"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Complexion</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        name="complexion"
                        value={formData.complexion}
                        onChange={handleInputChange}
                      >
                        <option value="">Complexion</option>
                        <option value="fair">Fair</option>
                        <option value="medium">Medium</option>
                        <option value="olive">Olive</option>
                        <option value="dark">Dark</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">Marital Status</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        name="maritial_status"
                        value={formData.maritial_status}
                        onChange={handleInputChange}
                      >
                        <option value="">Marital Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                        <option value="separated">Separated</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">Physical Status</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        name="physical_status"
                        value={formData.physical_status}
                        onChange={handleInputChange}
                      >
                        <option value="">Physical Status</option>
                        <option value="single">Single</option>
                        <option value="normal">Normal</option>
                        <option value="disabled">Disabled</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">Religion</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        name="religion"
                        value={formData.religion}
                        onChange={handleInputChange}
                      >
                        <option value="">Religion</option>
                        <option value="hindu">Hindu</option>
                        <option value="christian">Christian</option>
                        <option value="muslim">Muslim</option>
                        <option value="buddhist">Buddhist</option>
                        <option value="sikh">Sikh</option>
                        <option value="jewish">Jewish</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">Caste</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        name="cast"
                        value={formData.cast}
                        onChange={handleInputChange}
                      >
                        <option value="">Caste</option>
                        <option value="Mixed Jaffna Vellalar">
                          Mixed Jaffna Vellalar
                        </option>
                        <option value="Vellalar">Vellalar</option>
                        <option value="Other Vellatar">Other Vellatar</option>
                        <option value="Viswakulam">Viswakulam</option>
                        <option value="Mukkulanthor">Mukkulanthor</option>
                        <option value="Koviyor">Koviyor</option>
                        <option value="Kurukulam">Kurukulam</option>
                        <option value="Bhramin">Bhramin</option>
                        <option value="Kounder">Kounder</option>
                        <option value="Veera Saiva Vellalar">
                          Veera Saiva Vellalar
                        </option>
                        <option value="Kujavar">Kujavar</option>
                        <option value="Chettiar">Chettiar</option>
                        <option value="Devar">Devar</option>
                        <option value="Kaller">Kaller</option>
                        <option value="Malayalee">Malayalee</option>
                        <option value="Mukkuwar">Mukkuwar</option>
                        <option value="Muthaliyar">Muthaliyar</option>
                        <option value="Naiyudu">Naiyudu</option>
                        <option value="Nadar">Nadar</option>
                        <option value="Pallar">Pallar</option>
                        <option value="Parawar">Parawar</option>
                        <option value="Senkunthar">Senkunthar</option>
                        <option value="Siviyar">Siviyar</option>
                        <option value="Dadar">Dadar</option>
                        <option value="Sayakkarar">Sayakkarar</option>
                        <option value="Nalavar">Nalavar</option>
                        <option value="Agamiliyar">Agamiliyar</option>
                        <option value="Dobi">Dobi</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">Star Sign</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        name="star_sign"
                        value={formData.star_sign}
                        onChange={handleInputChange}
                      >
                        <option value="">Star Sign</option>
                        <option value="அச்வினி (Aswini)">
                          அச்வினி (Aswini)
                        </option>
                        <option value="பரணி (Bharani)">பரணி (Bharani)</option>
                        <option value="கார்த்திகை (Karthigai)">
                          கார்த்திகை (Karthigai)
                        </option>
                        <option value="ரோகிணி (Rohini)">ரோகிணி (Rohini)</option>
                        <option value="மிருகசீரிடம் (Mrigasiridam)">
                          மிருகசீரிடம் (Mrigasiridam)
                        </option>
                        <option value="திருவாதிரை (Thiruvathirai)">
                          திருவாதிரை (Thiruvathirai)
                        </option>
                        <option value="புனர்பூசம் (Punarpoosam)">
                          புனர்பூசம் (Punarpoosam)
                        </option>
                        <option value="பூசம் (Poosam)">பூசம் (Poosam)</option>
                        <option value="ஆயில்யம் (Ayilyam)">
                          ஆயில்யம் (Ayilyam)
                        </option>
                        <option value="மகம் (Magam)">மகம் (Magam)</option>
                        <option value="பூரம் (Pooram)">பூரம் (Pooram)</option>
                        <option value="உத்திரம் (Uthiram)">
                          உத்திரம் (Uthiram)
                        </option>
                        <option value="ஹஸ்தம் (Hastham)">
                          ஹஸ்தம் (Hastham)
                        </option>
                        <option value="சித்திரை (Chithirai)">
                          சித்திரை (Chithirai)
                        </option>
                        <option value="சுவாதி (Swathi)">சுவாதி (Swathi)</option>
                        <option value="விசாகம் (Visakam)">
                          விசாகம் (Visakam)
                        </option>
                        <option value="அனுஷம் (Anusham)">
                          அனுஷம் (Anusham)
                        </option>
                        <option value="கேட்டை (Kettai)">கேட்டை (Kettai)</option>
                        <option value="மூலம் (Moolam)">மூலம் (Moolam)</option>
                        <option value="பூராடம் (Pooradam)">
                          பூராடம் (Pooradam)
                        </option>
                        <option value="உத்திராடம் (Uthiradam)">
                          உத்திராடம் (Uthiradam)
                        </option>
                        <option value="திரைகடகம் (Thiruvonam)">
                          திரைகடகம் (Thiruvonam)
                        </option>
                        <option value="அவிட்டம் (Avittam)">
                          அவிட்டம் (Avittam)
                        </option>
                        <option value="சதயம் (Sathayam)">
                          சதயம் (Sathayam)
                        </option>
                        <option value="பூரட்டாதி (Purattadhi)">
                          பூரட்டாதி (Purattadhi)
                        </option>
                        <option value="உத்திரட்டாதி (Uthiraadhi)">
                          உத்திரட்டாதி (Uthiraadhi)
                        </option>
                        <option value="ரேவதி (Revadhi)">ரேவதி (Revadhi)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">
                        Rasi<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="rasi"
                        value={formData.rasi}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Rasi"
                      />
                    </div>

                    
                  </div>
                </div>

                {/* Location Section */}
                <div className="mb-6">
                  <h6 className="text-center font-medium text-lg mb-3">
                    Edit Location
                  </h6>
                  <hr className="mb-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block mb-1">
                        Country Of Birth<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="country_of_birth"
                        value={formData.country_of_birth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Country Of Birth"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        City Of Birth<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city_of_birth"
                        value={formData.city_of_birth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="City Of Birth"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Country Of Resident
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="country_of_resident"
                        value={formData.country_of_resident}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Country Of Resident"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        City Of Resident<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city_of_resident"
                        value={formData.city_of_resident}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="City Of Resident"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Country Of Citizenship
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="country_of_citizenship"
                        value={formData.country_of_citizenship}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Country Of Citizenship"
                      />
                    </div>
                  </div>
                </div>

                {/* Lifestyle Section */}
                <div className="mb-6">
                  <h6 className="text-center font-medium text-lg mb-3">
                    Edit Life Style
                  </h6>
                  <hr className="mb-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-1">Eating Habits</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        name="eating_habit"
                        value={formData.eating_habit}
                        onChange={handleInputChange}
                      >
                        <option value="">Eating Habits</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="nonVegetarian">Non-Vegetarian</option>
                        <option value="pescatarian">Pescatarian</option>
                        <option value="flexitarian">Flexitarian</option>
                        <option value="rawFood">Raw Food</option>
                        <option value="glutenFree">Gluten-Free</option>
                        <option value="lactoseFree">Lactose-Free</option>
                        <option value="organic">Organic</option>
                        <option value="halal">Halal</option>
                        <option value="kosher">Kosher</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">Smoking Habits</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        name="smoking_habit"
                        value={formData.smoking_habit}
                        onChange={handleInputChange}
                      >
                        <option value="">Smoking Habits</option>
                        <option value="nonSmoker">Non-Smoker</option>
                        <option value="occasionalSmoker">
                          Occasional Smoker
                        </option>
                        <option value="regularSmoker">Regular Smoker</option>
                        <option value="quitSmoking">
                          Former Smoker (Quit)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">Drinking Habits</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        name="drinking_habit"
                        value={formData.drinking_habit}
                        onChange={handleInputChange}
                      >
                        <option value="">Drinking Habits</option>
                        <option value="nonDrinker">Non-Drinker</option>
                        <option value="occasionalDrinker">
                          Occasional Drinker
                        </option>
                        <option value="socialDrinker">Social Drinker</option>
                        <option value="regularDrinker">Regular Drinker</option>
                        <option value="quitDrinking">
                          Former Drinker (Quit)
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Education & Professional Section */}
                <div className="mb-6">
                  <h6 className="text-center font-medium text-lg mb-3">
                    Edit Education & Professional
                  </h6>
                  <hr className="mb-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block mb-1">
                        Primary School<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="primary_school"
                        value={formData.primary_school}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Primary School"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Secondary School<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="secondary_school"
                        value={formData.secondary_school}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Secondary School"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Education</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                      >
                        <option value="">Education</option>
                        <option value="Primary">Primary Education</option>
                        <option value="Kinder garten">
                          Kindergarten/Preschool
                        </option>
                        <option value="Grade 1 to 5">Grade 1 to Grade 5</option>
                        <option value="Middle School">
                          Middle School/Junior High School
                        </option>
                        <option value="Grade 6 to 8">
                          Grade 6/7 to Grade 8/9
                        </option>
                        <option value="High School">
                          High School/Senior High School
                        </option>
                        <option value="Grade 9 to 12">
                          Grade 9/10 to Grade 12
                        </option>
                        <option value="Higher Secondary">
                          Higher Secondary Education
                        </option>
                        <option value="Vocational Training">
                          Vocational Training
                        </option>
                        <option value="Diploma Programs">
                          Diploma Programs
                        </option>
                        <option value="Associates Degree">
                          Associate's Degree
                        </option>
                        <option value="Undergraduate">
                          Undergraduate Education
                        </option>
                        <option value="Bachelors Degree">
                          Bachelor's Degree
                        </option>
                        <option value="Graduate">Graduate Education</option>
                        <option value="Masters Degree">Master's Degree</option>
                        <option value="Doctoral Degree">
                          Doctoral Degree (Ph.D. or equivalent)
                        </option>
                        <option value="Post Doc Research">
                          Post-Doctoral Research
                        </option>
                        <option value="Professional Education">
                          Professional Education
                        </option>
                        <option value="Certifications">
                          Professional Certifications
                        </option>
                        <option value="Specialized Training">
                          Specialized Training
                        </option>
                        <option value="Continuing Education">
                          Continuing Education
                        </option>
                        <option value="Online Distance Education">
                          Online and Distance Education
                        </option>
                        <option value="Lifelong Learning">
                          Lifelong Learning
                        </option>
                        <option value="any">Any</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">
                        Education Details<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="education_details"
                        value={formData.education_details}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Education Details"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Occupation</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                      >
                        <option value="">Occupation</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="engineer">Engineer</option>
                        <option value="doctor">Doctor</option>
                        <option value="nurse">Nurse</option>
                        <option value="programmer">Programmer</option>
                        <option value="artist">Artist</option>
                        <option value="scientist">Scientist</option>
                        <option value="lawyer">Lawyer</option>
                        <option value="chef">Chef</option>
                        <option value="entrepreneur">Entrepreneur</option>
                        <option value="accountant">Accountant</option>
                        <option value="writer">Writer</option>
                        <option value="police Officer">Police Officer</option>
                        <option value="firefighter">Firefighter</option>
                        <option value="pilot">Pilot</option>
                        <option value="architect">Architect</option>
                        <option value="pharmacist">Pharmacist</option>
                        <option value="salesperson">Salesperson</option>
                        <option value="athlete">Athlete</option>
                        <option value="musician">Musician</option>
                        <option value="journalist">Journalist</option>
                        <option value="psychologist">Psychologist</option>
                        <option value="chef">Chef</option>
                        <option value="mechanic">Mechanic</option>
                        <option value="designer">Designer</option>
                        <option value="veterinarian">Veterinarian</option>
                        <option value="electrician">Electrician</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">
                        Occupation Details
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="occupation_details"
                        value={formData.occupation_details}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Occupation Details"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Employed In</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        name="employed_in"
                        value={formData.employed_in}
                        onChange={handleInputChange}
                      >
                        <option value="">Employed In</option>
                        <option value="Government">Government</option>
                        <option value="Private Sector">Private Sector</option>
                        <option value="Non Profit">
                          Non-Profit Organization
                        </option>
                        <option value="Education">Education</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Technology">Technology/IT</option>
                        <option value="Finance">Finance/Banking</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                        <option value="Hospitality">Hospitality</option>
                        <option value="Construction">Construction</option>
                        <option value="Media">Media/Entertainment</option>
                        <option value="Transportation">
                          Transportation/Logistics
                        </option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Agriculture">Agriculture</option>
                        <option value="Arts">Arts/Culture</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Telecommunications">
                          Telecommunications
                        </option>
                        <option value="Energy">Energy</option>
                        <option value="Environment">
                          Environmental Services
                        </option>
                        <option value="Legal">Legal Services</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">
                        Annual Income<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="annual_income"
                        value={formData.annual_income}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Annual Income"
                      />
                    </div>
                  </div>
                </div>

                {/*Partner preference */}
                {/* Partner Preferences Section */}
      <div className="mb-6">
        <h6 className="text-center font-medium text-lg mb-3">
          Edit Partner Preferences
        </h6>
        <hr className="mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block mb-1">
              Country of Resident<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="partner_country_of_resident"
              value={formData.partner_country_of_resident}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Country of Resident"
            />
          </div>

          <div>
            <label className="block mb-1">Resident Status</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              name="partner_resident_status"
              value={formData.partner_resident_status}
              onChange={handleInputChange}
            >
              <option value="">Resident Status</option>
              <option value="citizen">Citizen</option>
              <option value="permanent_resident">Permanent Resident</option>
              <option value="temporary_resident">Temporary Resident</option>
              <option value="visitor">Visitor</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Education</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              name="partner_education"
              value={formData.partner_education}
              onChange={handleInputChange}
            >
              <option value="">Education</option>
              <option value="Primary">Primary Education</option>
              <option value="Kinder garten">Kindergarten/Preschool</option>
              <option value="Grade 1 to 5">Grade 1 to Grade 5</option>
              <option value="Middle School">Middle School/Junior High School</option>
              <option value="Grade 6 to 8">Grade 6/7 to Grade 8/9</option>
              <option value="High School">High School/Senior High School</option>
              <option value="Grade 9 to 12">Grade 9/10 to Grade 12</option>
              <option value="Higher Secondary">Higher Secondary Education</option>
              <option value="Vocational Training">Vocational Training</option>
              <option value="Diploma Programs">Diploma Programs</option>
              <option value="Associates Degree">Associate's Degree</option>
              <option value="Undergraduate">Undergraduate Education</option>
              <option value="Bachelors Degree">Bachelor's Degree</option>
              <option value="Graduate">Graduate Education</option>
              <option value="Masters Degree">Master's Degree</option>
              <option value="Doctoral Degree">Doctoral Degree (Ph.D. or equivalent)</option>
              <option value="Post Doc Research">Post-Doctoral Research</option>
              <option value="Professional Education">Professional Education</option>
              <option value="Certifications">Professional Certifications</option>
              <option value="Specialized Training">Specialized Training</option>
              <option value="Continuing Education">Continuing Education</option>
              <option value="Online Distance Education">Online and Distance Education</option>
              <option value="Lifelong Learning">Lifelong Learning</option>
              <option value="any">Any</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Occupation</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              name="partner_occupation"
              value={formData.partner_occupation}
              onChange={handleInputChange}
            >
              <option value="">Occupation</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="engineer">Engineer</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="programmer">Programmer</option>
              <option value="artist">Artist</option>
              <option value="scientist">Scientist</option>
              <option value="lawyer">Lawyer</option>
              <option value="chef">Chef</option>
              <option value="entrepreneur">Entrepreneur</option>
              <option value="accountant">Accountant</option>
              <option value="writer">Writer</option>
              <option value="police Officer">Police Officer</option>
              <option value="firefighter">Firefighter</option>
              <option value="pilot">Pilot</option>
              <option value="architect">Architect</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="salesperson">Salesperson</option>
              <option value="athlete">Athlete</option>
              <option value="musician">Musician</option>
              <option value="journalist">Journalist</option>
              <option value="psychologist">Psychologist</option>
              <option value="mechanic">Mechanic</option>
              <option value="designer">Designer</option>
              <option value="veterinarian">Veterinarian</option>
              <option value="electrician">Electrician</option>
              <option value="Other">Other</option>
              <option value="Any">Any</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">
              Annual Income<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="partner_annual_income"
              value={formData.partner_annual_income}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Annual Income"
            />
          </div>

          <div>
            <label className="block mb-1">Marital Status</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              name="partner_marital_status"
              value={formData.partner_marital_status}
              onChange={handleInputChange}
            >
              <option value="">Marital Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
              <option value="separated">Separated</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">
              Minimum Age<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="partner_minimum_age"
              value={formData.partner_minimum_age}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Minimum Age"
            />
          </div>

          <div>
            <label className="block mb-1">
              Maximum Age<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="partner_maximum_age"
              value={formData.partner_maximum_age}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Maximum Age"
            />
          </div>

          <div>
            <label className="block mb-1">
              Minimum Height<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="partner_minimum_height"
              value={formData.partner_minimum_height}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Minimum Height"
            />
          </div>

          <div>
            <label className="block mb-1">
              Maximum Height<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="partner_maximum_height"
              value={formData.partner_maximum_height}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Maximum Height"
            />
          </div>

          <div>
            <label className="block mb-1">Physical Status</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              name="partner_physical_status"
              value={formData.partner_physical_status}
              onChange={handleInputChange}
            >
              <option value="">Physical Status</option>
              <option value="single">Single</option>
              <option value="normal">Normal</option>
              <option value="disabled">Disabled</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Mother Tongue</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              name="partner_mother_tongue"
              value={formData.partner_mother_tongue}
              onChange={handleInputChange}
            >
              <option value="">Mother Tongue</option>
              <option value="tamil">Tamil</option>
              <option value="sinhala">Sinhala</option>
              <option value="english">English</option>
              <option value="other">Other</option>
              <option value="Any">Any</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Religion</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              name="partner_religion"
              value={formData.partner_religion}
              onChange={handleInputChange}
            >
              <option value="">Religion</option>
              <option value="hindu">Hindu</option>
              <option value="christian">Christian</option>
              <option value="muslim">Muslim</option>
              <option value="buddhist">Buddhist</option>
              <option value="sikh">Sikh</option>
              <option value="jewish">Jewish</option>
              <option value="other">Other</option>
              <option value="Any">Any</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Star Sign</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              name="partner_star_sign"
              value={formData.partner_star_sign}
              onChange={handleInputChange}
            >
              <option value="">Star Sign</option>
              <option value="அச்வினி (Aswini)">அச்வினி (Aswini)</option>
              <option value="பரணி (Bharani)">பரணி (Bharani)</option>
              <option value="கார்த்திகை (Karthigai)">கார்த்திகை (Karthigai)</option>
              <option value="ரோகிணி (Rohini)">ரோகிணி (Rohini)</option>
              <option value="மிருகசீரிடம் (Mrigasiridam)">மிருகசீரிடம் (Mrigasiridam)</option>
              <option value="திருவாதிரை (Thiruvathirai)">திருவாதிரை (Thiruvathirai)</option>
              <option value="புனர்பூசம் (Punarpoosam)">புனர்பூசம் (Punarpoosam)</option>
              <option value="பூசம் (Poosam)">பூசம் (Poosam)</option>
              <option value="ஆயில்யம் (Ayilyam)">ஆயில்யம் (Ayilyam)</option>
              <option value="மகம் (Magam)">மகம் (Magam)</option>
              <option value="பூரம் (Pooram)">பூரம் (Pooram)</option>
              <option value="உத்திரம் (Uthiram)">உத்திரம் (Uthiram)</option>
              <option value="ஹஸ்தம் (Hastham)">ஹஸ்தம் (Hastham)</option>
              <option value="சித்திரை (Chithirai)">சித்திரை (Chithirai)</option>
              <option value="சுவாதி (Swathi)">சுவாதி (Swathi)</option>
              <option value="விசாகம் (Visakam)">விசாகம் (Visakam)</option>
              <option value="அனுஷம் (Anusham)">அனுஷம் (Anusham)</option>
              <option value="கேட்டை (Kettai)">கேட்டை (Kettai)</option>
              <option value="மூலம் (Moolam)">மூலம் (Moolam)</option>
              <option value="பூராடம் (Pooradam)">பூராடம் (Pooradam)</option>
              <option value="உத்திராடம் (Uthiradam)">உத்திராடம் (Uthiradam)</option>
              <option value="திரைகடகம் (Thiruvonam)">திரைகடகம் (Thiruvonam)</option>
              <option value="அவிட்டம் (Avittam)">அவிட்டம் (Avittam)</option>
              <option value="சதயம் (Sathayam)">சதயம் (Sathayam)</option>
              <option value="பூரட்டாதி (Purattadhi)">பூரட்டாதி (Purattadhi)</option>
              <option value="உத்திரட்டாதி (Uthiraadhi)">உத்திரட்டாதி (Uthiraadhi)</option>
              <option value="ரேவதி (Revadhi)">ரேவதி (Revadhi)</option>
              <option value="Any">Any</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Caste</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              name="partner_cast"
              value={formData.partner_cast}
              onChange={handleInputChange}
            >
              <option value="">Caste</option>
              <option value="Mixed Jaffna Vellalar">Mixed Jaffna Vellalar</option>
              <option value="Vellalar">Vellalar</option>
              <option value="Other Vellatar">Other Vellatar</option>
              <option value="Viswakulam">Viswakulam</option>
              <option value="Mukkulanthor">Mukkulanthor</option>
              <option value="Koviyor">Koviyor</option>
              <option value="Kurukulam">Kurukulam</option>
              <option value="Bhramin">Bhramin</option>
              <option value="Kounder">Kounder</option>
              <option value="Veera Saiva Vellalar">Veera Saiva Vellalar</option>
              <option value="Kujavar">Kujavar</option>
              <option value="Chettiar">Chettiar</option>
              <option value="Devar">Devar</option>
              <option value="Kaller">Kaller</option>
              <option value="Malayalee">Malayalee</option>
              <option value="Mukkuwar">Mukkuwar</option>
              <option value="Muthaliyar">Muthaliyar</option>
              <option value="Naiyudu">Naiyudu</option>
              <option value="Nadar">Nadar</option>
              <option value="Pallar">Pallar</option>
              <option value="Parawar">Parawar</option>
              <option value="Senkunthar">Senkunthar</option>
              <option value="Siviyar">Siviyar</option>
              <option value="Dadar">Dadar</option>
              <option value="Sayakkarar">Sayakkarar</option>
              <option value="Nalavar">Nalavar</option>
              <option value="Agamiliyar">Agamiliyar</option>
              <option value="Dobi">Dobi</option>
              <option value="Other">Other</option>
              <option value="Any">Any</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Eating Habits</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              name="partner_eating_habit"
              value={formData.partner_eating_habit}
              onChange={handleInputChange}
            >
              <option value="">Eating Habits</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="nonVegetarian">Non-Vegetarian</option>
              <option value="pescatarian">Pescatarian</option>
              <option value="flexitarian">Flexitarian</option>
              <option value="rawFood">Raw Food</option>
              <option value="glutenFree">Gluten-Free</option>
              <option value="lactoseFree">Lactose-Free</option>
              <option value="organic">Organic</option>
              <option value="halal">Halal</option>
              <option value="kosher">Kosher</option>
              <option value="Any">Any</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Smoking Habits</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              name="partner_smoking_habit"
              value={formData.partner_smoking_habit}
              onChange={handleInputChange}
            >
              <option value="">Smoking Habits</option>
              <option value="nonSmoker">Non-Smoker</option>
              <option value="occasionalSmoker">Occasional Smoker</option>
              <option value="regularSmoker">Regular Smoker</option>
              <option value="quitSmoking">Former Smoker (Quit)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Drinking Habits</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              name="partner_drinking_habit"
              value={formData.partner_drinking_habit}
              onChange={handleInputChange}
            >
              <option value="">Drinking Habits</option>
              <option value="nonDrinker">Non-Drinker</option>
              <option value="occasionalDrinker">Occasional Drinker</option>
              <option value="socialDrinker">Social Drinker</option>
              <option value="regularDrinker">Regular Drinker</option>
              <option value="quitDrinking">Former Drinker (Quit)</option>
            </select>
          </div>
        </div>
      </div>

                {/* Family Details Section */}
                <div className="mb-6">
                  <h6 className="text-center font-medium text-lg mb-3">
                    Edit Family Details
                  </h6>
                  <hr className="mb-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block mb-1">Family Value</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        name="family_value"
                        value={formData.family_value}
                        onChange={handleInputChange}
                      >
                        <option value="">Family Value</option>
                        <option value="conservative">Conservative</option>
                        <option value="moderate">Moderate</option>
                        <option value="modern">Modern</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">Family Type</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        name="family_type"
                        value={formData.family_type}
                        onChange={handleInputChange}
                      >
                        <option value="">Family Type</option>
                        <option value="joint">Joint Family</option>
                        <option value="nuclear">Nuclear Family</option>
                        <option value="others">Others</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">Family Status</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        name="family_status"
                        value={formData.family_status}
                        onChange={handleInputChange}
                      >
                        <option value="">Family Status</option>
                        <option value="low">Lower Class</option>
                        <option value="lowerMiddle">Lower Middle Class</option>
                        <option value="middle">Middle Class</option>
                        <option value="upperMiddle">Upper Middle Class</option>
                        <option value="upper">Upper Class</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">
                        Fathers Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fathers_name"
                        value={formData.fathers_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Fathers Name"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Fathers Occupation
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fathers_occupation"
                        value={formData.fathers_occupation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Fathers Occupation"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Fathers Native Place
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fathers_native_place"
                        value={formData.fathers_native_place}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Fathers Native Place"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Mothers Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="mothers_name"
                        value={formData.mothers_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Mothers Name"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Mothers Occupation
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="mothers_occupation"
                        value={formData.mothers_occupation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Mothers Occupation"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Mothers Native Place
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name=".mothers_native_place"
                        value={formData.mothers_native_place}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Mothers Native Place"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">
                        Brothers<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="brothers"
                        value={formData.brothers}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Brothers"
                      />
                    </div>
                    <div>
                    <label className="block mb-1">
                      Married Brothers
                    </label>
                    <input
                      type="text"
                      name="married_brothers"
                      value={formData.married_brothers}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Number of married brothers"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">
                      Sisters
                    </label>
                    <input
                      type="text"
                      name="sisters"
                      value={formData.sisters}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Number of sisters"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">
                      Married Sisters
                    </label>
                    <input
                      type="text"
                      name="married_sisters"
                      value={formData.married_sisters}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Number of married sisters"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">
                      More Family Info
                    </label>
                    <input
                      type="text"
                      name="more_family"
                      value={formData.more_family}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Additional family information"
                    />
                  </div>

    
                   </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6 border-t pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <FaSpinner className="animate-spin inline-block mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

      {showCropper && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}   
        
      {/* Nested Image Upload Modal */}
{/* Nested Image Upload Modal */}
{showImageModal && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center">
    <div 
      className="absolute inset-0 bg-black bg-opacity-50"
      onClick={(e) => {
        e.stopPropagation();
        setShowImageModal(false);
        setImageFile(null);
        setImagePreview('');
      }}
    ></div>
    <div 
      className="relative bg-white rounded-lg shadow-xl w-full max-w-lg z-[70]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-6 pt-5 pb-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Upload {imageType.replace('_', ' ')}
        </h3>
        
        {/* Show info message for images that will be cropped */}
        {imageType === 'profile_img' && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Profile image will be cropped for optimal display.
              Please select an image with good quality and clear visibility.
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        </div>
        
        {/* Show preview for chart_img, img_1, and img_2 (non-cropped images) */}
        {(imageType === 'chart_img' || imageType === 'img_1' || imageType === 'img_2') && imagePreview && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-w-full h-auto max-h-64 mx-auto rounded-md border"
            />
          </div>
        )}
      </div>
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        {/* Show upload button for all image types except profile_img (which goes through cropping) */}
        {imageType !== 'profile_img' && (
          <button
            type="button"
            onClick={uploadImage}
            disabled={!imageFile || loading}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : 'Upload'}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setShowImageModal(false);
            setImageFile(null);
            setImagePreview('');
          }}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

    {/* Nested Password Update Modal */}
    {showPasswordModal && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={(e) => {
            e.stopPropagation();
            setShowPasswordModal(false);
            setNewPassword('');
            setConfirmPassword('');
            setError('');
          }}
        ></div>
        <div 
          className="relative bg-white rounded-lg shadow-xl w-full max-w-md z-[70]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 pt-5 pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Update Password for {selectedProfile?.first_name} {selectedProfile?.last_name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-500" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-500" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(false);
                setNewPassword('');
                setConfirmPassword('');
                setError('');
              }}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}


 
      



    </div>
  );
}

export default AdminProfiles;