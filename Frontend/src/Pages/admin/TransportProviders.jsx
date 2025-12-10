import React from "react";
import {
  FaPlus,
  FaEye,
  FaHome,
  FaTruck,
  FaWhatsapp,
} from "react-icons/fa";
import { motion } from "framer-motion";

function TransportProviders() {
 const whatsappShareMessage = `🚚 *Transport Providers Needed!* 🚚

We're coordinating transport support for our fellow Sri Lankans during this mass disaster situation.

If you can provide transport services (trucks, lorries, vans, or any vehicles) for delivering relief items, please register here:

📊 *View All Transport Providers:* https://docs.google.com/spreadsheets/d/1Mv7sSDaGTK7pjzBT9vYvI_4xY7hCC8U4ggF_KbOSeTQ/edit?usp=drivesdk

Your transport support can help deliver essential relief items to the most needy areas.

Thank you for your service to our nation.

'We Help Sri Lanka' Volunteer Movement
Let's Rebuild Our Motherland 🇱🇰`;

  // Function to handle WhatsApp sharing
  const handleWhatsAppShare = () => {
    const encodedMessage = encodeURIComponent(whatsappShareMessage);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Function to open external links
  const openExternalLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="p-4 md:p-6 pt-20 md:pt-24">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Transport Providers Management
              </h1>
              <p className="text-gray-600">
                Manage and track all Transport Providers across Sri Lanka
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <FaHome className="text-blue-500" />
              <span className="text-gray-500">/</span>
              <span className="text-gray-800 font-medium">
                Transport Providers
              </span>
            </div>
          </div>
        </div>

        {/* WhatsApp Share Button */}
        <div className="flex justify-end mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleWhatsAppShare}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            <FaWhatsapp className="text-xl" />
            <span>Share on WhatsApp</span>
          </motion.button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Transport Providers
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Management Portal
                </p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <FaTruck className="text-lg md:text-2xl text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Add Providers
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Google Form
                </p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                <FaPlus className="text-lg md:text-2xl text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  View Providers
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Google Sheets
                </p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <FaEye className="text-lg md:text-2xl text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Transportation
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Support Network
                </p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
                <FaTruck className="text-lg md:text-2xl text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Buttons Section */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Transport Providers Portal
              </h2>
              <p className="text-gray-600">
                Use the buttons below to add new transport providers or view existing ones.
                Both options open in new tabs for your convenience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Transport Providers Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
                onClick={() => openExternalLink("https://forms.gle/zpHaxLT491DjVVsz9")}
              >
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 h-full hover:shadow-lg transition-all duration-300 hover:border-green-300">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mb-4">
                      <FaPlus className="text-2xl md:text-3xl text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Add Transport Providers
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Click to open Google Form where you can submit new transport provider information.
                    </p>
                    <div className="mt-auto">
                      <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg">
                        <FaPlus className="mr-2" />
                        <span>Open Form</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* View Transport Providers Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
                onClick={() => openExternalLink("https://docs.google.com/spreadsheets/d/1Mv7sSDaGTK7pjzBT9vYvI_4xY7hCC8U4ggF_KbOSeTQ/edit?usp=drivesdk")}
              >
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 h-full hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                      <FaEye className="text-2xl md:text-3xl text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      View Transport Providers
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Click to open Google Sheets where you can view all registered transport providers.
                    </p>
                    <div className="mt-auto">
                      <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg">
                        <FaEye className="mr-2" />
                        <span>Open Sheet</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Instructions Section */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                How to Use This Portal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-blue-500 font-bold text-lg mb-2">1</div>
                  <h4 className="font-medium text-gray-800 mb-2">Add New Providers</h4>
                  <p className="text-sm text-gray-600">
                    Use the "Add Transport Providers" button to submit new transport provider details through Google Form.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-blue-500 font-bold text-lg mb-2">2</div>
                  <h4 className="font-medium text-gray-800 mb-2">View Existing Data</h4>
                  <p className="text-sm text-gray-600">
                    Use the "View Transport Providers" button to see all registered providers in Google Sheets.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-blue-500 font-bold text-lg mb-2">3</div>
                  <h4 className="font-medium text-gray-800 mb-2">Share Information</h4>
                  <p className="text-sm text-gray-600">
                    Use the WhatsApp share button to spread awareness about transportation support availability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Access Links
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <FaPlus className="text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Google Form</div>
                  <div className="text-sm text-gray-500 truncate">
                    https://forms.gle/zpHaxLT491DjVVsz9
                  </div>
                </div>
              </div>
              <button
                onClick={() => openExternalLink("https://forms.gle/zpHaxLT491DjVVsz9")}
                className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
              >
                Open
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <FaEye className="text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Google Sheets</div>
                  <div className="text-sm text-gray-500 truncate">
                    https://docs.google.com/spreadsheets/d/1Mv7sSDaGTK7pjzBT9vYvI_4xY7hCC8U4ggF_KbOSeTQ/edit
                  </div>
                </div>
              </div>
              <button
                onClick={() => openExternalLink("https://docs.google.com/spreadsheets/d/1Mv7sSDaGTK7pjzBT9vYvI_4xY7hCC8U4ggF_KbOSeTQ/edit?usp=drivesdk")}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
              >
                Open
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransportProviders;