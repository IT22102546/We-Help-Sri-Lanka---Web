import { Search } from "lucide-react";
import React, { useState, useEffect } from "react";
import { FaHome, FaTrash, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function AdminInterested() {
  const [interests, setInterests] = useState([]);
  const [allInterests, setAllInterests] = useState([]); // Store all interests
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState(null);
  const navigate = useNavigate();

  // Fetch interests data
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await fetch("/api/admin/interests");
        if (!response.ok) {
          throw new Error("Failed to fetch interests");
        }
        const data = await response.json();
        setInterests(data);
        setAllInterests(data); // Store all interests
      } catch (error) {
        console.error("Error fetching interests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, []);

  // Search function
  const handleSearch = async () => {
    try {
      if (searchKey.trim() === "") {
        // If search is empty, show all interests
        setInterests(allInterests);
        return;
      }

      const response = await fetch(
        `/api/admin/interests/search?search=${searchKey}`
      );
      if (!response.ok) {
        throw new Error("Failed to search interests");
      }
      const data = await response.json();
      setInterests(data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // Reset to show all interests when search is cleared
  useEffect(() => {
    if (searchKey === "") {
      setInterests(allInterests);
    }
  }, [searchKey, allInterests]);

  // Delete functions
  const handleDeleteClick = (interest) => {
    setSelectedInterest(interest);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `/api/admin/interests/${selectedInterest.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete interest");
      }

      // Update both interests and allInterests
      const updatedInterests = interests.filter(
        (i) => i.id !== selectedInterest.id
      );
      const updatedAllInterests = allInterests.filter(
        (i) => i.id !== selectedInterest.id
      );

      setInterests(updatedInterests);
      setAllInterests(updatedAllInterests);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Delete error:", error);
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
          <h5 className="text-xl font-semibold mb-3">Interested</h5>

          <nav aria-label="breadcrumb">
            <ol className="breadcrumb flex items-center space-x-3 text-sm text-gray-600">
              <li className="breadcrumb-item flex items-center">
                <a href="/" className="hover:text-blue-600 flex items-center">
                  <FaHome className="mr-2 text-lg" />
                  Home
                </a>
              </li>
              <li className="breadcrumb-item">
                <a href="#" className="hover:text-blue-600">
                  / Interested
                </a>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Search Row */}
      <div className="flex justify-center mb-4 w-full">
        <div className="relative w-full max-w-lg">
          <input
            type="text"
            className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            onKeyUp={handleSearch}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Interests Table */}
      <div className="card bg-white shadow-sm rounded-lg mb-6">
        <div className="card-body p-4">
          <h5 className="text-xl font-semibold mb-3">Interested</h5>

          <div className="table-responsive mt-6">
            <div className="overflow-x-auto bg-white shadow rounded-lg">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium font-workSans text-gray-700">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium font-workSans text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium font-workSans text-gray-700">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium font-workSans text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {interests.map((interest, index) => (
                    <tr key={interest.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">{interest.name}</td>
                      <td className="px-4 py-3">{interest.email}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteClick(interest)}
                          className="px-2 py-1 text-white bg-red-600 rounded-full hover:bg-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-red-600">
                      Warning!
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        If you want to remove this data, <b>you can't undo</b>,
                        It will affect the relevant records!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Yes
                </button>
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
    </div>
  );
}

export default AdminInterested;
