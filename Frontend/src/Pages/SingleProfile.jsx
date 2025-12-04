import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MapPin,
  Cake,
  Ruler,
  Palette,
  Home,
  Heart,
  Utensils,
  Wine,
  BookOpen,
  Ribbon,
  GraduationCap,
  Briefcase,
  Users,
  DollarSign,
  User,
  ArrowRight,
  Lock,
  MessageCircle,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SingleProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showChartModal, setShowChartModal] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [resolvedImageUrls, setResolvedImageUrls] = useState([]);
  const [resolvedChartUrl, setResolvedChartUrl] = useState(null);
  
  // Define both storage URLs to check
  const storageUrls = [
    "https://api.viwahaa.com/uploads",
    "https://mobile.viwahaa.com/uploads"
  ];



  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/user/getuser/${id}`);
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Function to check if image exists at a URL
  const checkImageExists = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Function to resolve image URL by checking multiple storage locations
  const resolveImageUrl = async (imagePath) => {
    if (!imagePath) return null;
    
    // If imagePath is already a full URL, return it
    if (imagePath.startsWith('http')) return imagePath;
    
    // Check each storage URL for the image
    for (const baseUrl of storageUrls) {
      const url = `${baseUrl}/${imagePath}`;
      const exists = await checkImageExists(url);
      if (exists) return url;
    }
    
    return null; // Image not found in any storage
  };

  // Resolve all image URLs when user data is loaded
  useEffect(() => {
    const resolveImages = async () => {
      if (!user) return;
      
      const imagesToResolve = [];
      
      // Only include images for Ultimate users
      if (currentUser?.user.package_plan === "Ultimate Plan") {
        if (user?.profile_img) imagesToResolve.push(user.profile_img);
        if (user?.img_1) imagesToResolve.push(user.img_1);
        if (user?.img_2) imagesToResolve.push(user.img_2);
      }
      
      // Resolve all image URLs
      const resolvedUrls = [];
      for (const imgPath of imagesToResolve) {
        const url = await resolveImageUrl(imgPath);
        if (url) resolvedUrls.push(url);
      }
      setResolvedImageUrls(resolvedUrls);
      
      // Resolve chart image if user has Premium/Ultimate
      if (currentUser?.user.package_plan === "Premium Plan" || 
          currentUser?.user.package_plan === "Ultimate Plan") {
        if (user?.chart_img) {
          const chartUrl = await resolveImageUrl(user.chart_img);
          setResolvedChartUrl(chartUrl);
        }
      }
    };
    
    resolveImages();
  }, [user, currentUser]);

  const showUpgradeAlert = (feature, planType = "Ultimate") => {
    if (confirm(`Upgrade to ${planType} account to ${feature}.`)) {
      navigate("/pricing");
    }
  };

const handleViewChart = () => {
  if (isBasicUser) {
    showUpgradeAlert("view birth charts", "Standard");
    return;
  }
  setShowChartModal(true);
};

// Update the chart image resolution logic
useEffect(() => {
  const resolveImages = async () => {
    if (!user) return;
    
    const imagesToResolve = [];
    
    // Only include images for Ultimate users
    if (isUltimate) {
      if (user?.profile_img) imagesToResolve.push(user.profile_img);
      if (user?.img_1) imagesToResolve.push(user.img_1);
      if (user?.img_2) imagesToResolve.push(user.img_2);
    }
    
    // Resolve all image URLs
    const resolvedUrls = [];
    for (const imgPath of imagesToResolve) {
      const url = await resolveImageUrl(imgPath);
      if (url) resolvedUrls.push(url);
    }
    setResolvedImageUrls(resolvedUrls);
    
    // Resolve chart image for Standard/Premium/Ultimate users
    if (isStandardOrAbove && user?.chart_img) {
      const chartUrl = await resolveImageUrl(user.chart_img);
      setResolvedChartUrl(chartUrl);
    }
  };
  
  resolveImages();
}, [user, currentUser]);


{isStandardOrAbove && (
  <button
    onClick={handleViewChart}
    className="text-primary-500 hover:text-primary-700 underline flex items-center"
  >
    View chart <ArrowRight className="w-4 h-4 ml-1" />
  </button>
)}


{!isStandardOrAbove && (
  <div
    onClick={() => showUpgradeAlert("view birth charts", "Standard")}
    className="bg-blue-50 border border-blue-200 p-4 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
  >
    <div className="flex justify-between items-center">
      <div>
        <h3 className="font-serif text-blue-700 text-lg">
          Upgrade to Standard
        </h3>
        <p className="text-blue-600 text-sm mt-1">
          View birth charts and basic compatibility
        </p>
      </div>
      <ArrowRight className="w-6 h-6 text-blue-500" />
    </div>
  </div>
)}

  const nextImage = () => {
    setActiveImageIndex((prev) => 
      prev === resolvedImageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => 
      prev === 0 ? resolvedImageUrls.length - 1 : prev - 1
    );
  };

  const renderDetailItem = (IconComponent, label, value) => (
    <div className="flex items-center w-full sm:w-1/2 md:w-1/3 lg:w-1/4 mb-4">
      <IconComponent className="w-5 h-5 text-primary-500 mr-2" />
      <span className="text-gray-600 text-sm mr-1">{label}:</span>
      <span className="text-gray-800 text-sm font-medium">
        {value || "Not specified"}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">User not found.</div>
      </div>
    );
  }

  const isBasicUser = !currentUser || 
                   !currentUser.user.package_plan || 
                   currentUser.user.package_plan === "Basic Plan";

const isStandardOrAbove = !isBasicUser; 
const isUltimate = currentUser?.user.package_plan === "Ultimate Plan";
const isPremiumOrUltimate = currentUser?.user.package_plan === "Premium Plan" || 
                           currentUser?.user.package_plan === "Ultimate Plan";


  const renderMemberIdBadge = () => (
    <div className="flex justify-center mb-4">
      <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
        Member ID: {user.member_id}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-primary-500 mb-6 hover:text-primary-700 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to matches
      </button>

      {/* Profile Header */}
      <div className="text-center mb-8">
        {user.member_id && renderMemberIdBadge()}
        <h1 className="text-3xl font-serif font-medium text-gray-900">
          {isUltimate ? (
            `${user.first_name} ${user.last_name}, ${user.age}`
          ) : (
            `${currentUser?.user.gender === "male" ? "Bride" : "Groom"}, ${user.age}`
          )}
        </h1>
        <div className="flex items-center justify-center text-gray-600 mt-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span>
            {user.city_of_resident}, {user.country_of_resident}
          </span>
        </div>
      </div>
      
      {/* Image Gallery */}
      
<div className="relative mb-8 rounded-xl overflow-hidden bg-gray-100">
  {isUltimate ? (
    resolvedImageUrls.length > 0 ? (
      <>
        <div
          className="relative w-full"
          style={{ height: "clamp(400px, 60vh, 600px)" }}
        >
          <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
            <img
              src={resolvedImageUrls[activeImageIndex]}
              alt={`${user.first_name}'s profile`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
            />

            {/* Navigation Arrows */}
            {resolvedImageUrls.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Image Indicators */}
        {resolvedImageUrls.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {resolvedImageUrls.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  activeImageIndex === index
                    ? "bg-primary-500"
                    : "bg-white/50"
                }`}
                onClick={() => setActiveImageIndex(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </>
    ) : (
      <div className="w-full h-64 flex justify-center items-center bg-gray-200">
        <User className="w-24 h-24 text-gray-400" />
      </div>
    )
  ) : (
    <div className="w-full h-64 flex flex-col justify-center items-center bg-gray-200 p-6">
      <Lock className="w-16 h-16 text-gray-400 mb-4" />
      <p className="text-gray-600 text-center mb-4">
        Upgrade to Ultimate Plan to view profile photos
      </p>
      <button
        onClick={() => navigate("/pricing")}
        className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors"
      >
        Upgrade Now
      </button>
    </div>
  )}
</div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - About Me */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Me Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
              <h2 className="text-xl font-serif text-primary-500">About Me</h2> 
              {isStandardOrAbove  && (
                <button
                  onClick={handleViewChart}
                  className="text-primary-500 hover:text-primary-700 underline flex items-center"
                >
                  View chart <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">
              {user.education_details || "No bio available"}
            </p>

            <div className="flex flex-wrap">
              {/* Always show basic info */}
              {renderDetailItem(Cake, "Age", user.age)}
              {renderDetailItem(BookOpen, "Religion", user.religion)}
              {renderDetailItem(Briefcase, "Occupation", user.occupation || user.occupation_details)}
              {renderDetailItem(MapPin, "Country", user.country_of_resident)}

              {/* Only show additional details for premium/ultimate users */}
              {!isBasicUser && (
                <>
                  {renderDetailItem(Ruler, "Height", user.height)}
                  {renderDetailItem(Palette, "Complexion", user.complexion)}
                  {renderDetailItem(Home, "Family Type", user.family_type)}
                  {renderDetailItem(Heart, "Status", user.maritial_status)}
                  {renderDetailItem(Utensils, "Diet", user.eating_habit)}
                  {renderDetailItem(Wine, "Drinking", user.drinking_habit)}
                  {renderDetailItem(Wine, "Smoking", user.smoking_habit)}
                  {renderDetailItem(Ribbon, "Cast", user.cast)}
                </>
              )}
            </div>
          </div>

          {/* Family & Education - Only show for non-basic users */}
          {!isBasicUser && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-serif text-primary-500 border-b border-gray-100 pb-4 mb-4">
                Family & Education
              </h2>
              <div className="flex flex-col">
                {renderDetailItem(GraduationCap, "Education", user.education || "Not specified")}
                {renderDetailItem(Briefcase, "Occupation", user.occupation || "Not specified")}
                {renderDetailItem(Users, "Family Values", user.family_value || "Not specified")}
                {renderDetailItem(DollarSign, "Family Status", user.family_status || "Not specified")}
                
                {/* Additional family details for Ultimate Plan */}
                {isUltimate && (
                  <>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h3 className="text-lg font-medium text-gray-800 mb-3">Father's Details</h3>
                      <div className="flex flex-wrap">
                        {renderDetailItem(User, "Name", user.fathers_name || "Not specified")}
                        {renderDetailItem(Briefcase, "Occupation", user.fathers_occupation || "Not specified")}
                        {renderDetailItem(MapPin, "Native Place", user.fathers_native_place || "Not specified")}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h3 className="text-lg font-medium text-gray-800 mb-3">Mother's Details</h3>
                      <div className="flex flex-wrap">
                        {renderDetailItem(User, "Name", user.mothers_name || "Not specified")}
                        {renderDetailItem(Briefcase, "Occupation", user.mothers_occupation|| "Not specified")}
                        {renderDetailItem(MapPin, "Native Place", user.mothers_native_place|| "Not specified")}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h3 className="text-lg font-medium text-gray-800 mb-3">Siblings</h3>
                      <div className="flex flex-wrap">
                        {renderDetailItem(User, "Brothers", user.brothers || "Not specified")}
                        {renderDetailItem(User, "Married Brothers", user.married_brothers || "Not specified")}
                        {renderDetailItem(User, "Sisters", user.sisters || "Not specified")}
                        {renderDetailItem(User, "Married Sisters", user.married_sisters || "Not specified")}
                        {renderDetailItem(User, "More About Family", user.more_family || "Not specified", true)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Partner Preferences */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-serif text-primary-500 border-b border-gray-100 pb-4 mb-4">
              Partner Preferences
            </h2>
            <div className="flex flex-wrap">
              {renderDetailItem(
                User,
                "Age",
                `${user.partner_minimum_age} - ${user.partner_maximum_age}`
              )}
              {renderDetailItem(
                Ruler,
                "Height",
                `${user.partner_minimum_height} - ${user.partner_maximum_height}cm`
              )}
              {renderDetailItem(BookOpen, "Religion", user.partner_religion)}
              {renderDetailItem(Ribbon, "Cast", user.partner_cast)}
              {renderDetailItem(Utensils, "Diet", user.partner_eating_habit)}
              {renderDetailItem(Wine, "Drinking", user.partner_drinking_habit)}
              {renderDetailItem(Wine, "Smoking", user.partner_smoking_habit)}
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Contact Button */}
          <button
            onClick={() => navigate(`/chat/${user.id}`)}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-xl flex items-center justify-center transition-colors"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Chat Now</span>
          </button>

          {/* Shortlist Button */}
          <button className="w-full bg-white border border-primary-500 text-primary-500 hover:bg-primary-50 py-3 px-6 rounded-xl flex items-center justify-center transition-colors">
            <Star className="w-5 h-5 mr-2" />
            <span className="font-medium">Add to Shortlist</span>
          </button>

          {/* Upgrade Banner for Photos */}
          {!isUltimate && (
            <div
              onClick={() => showUpgradeAlert("view all photos")}
              className="bg-primary-50 border border-primary-200 p-4 rounded-xl cursor-pointer hover:bg-primary-100 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif text-primary-700 text-lg">
                    Upgrade to Ultimate
                  </h3>
                  <p className="text-primary-600 text-sm mt-1">
                    View all photos and get premium matching
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          )}

          {/* Upgrade Banner for Charts */}
          {!isPremiumOrUltimate && (
            <div
              onClick={() => showUpgradeAlert("view birth charts", "Premium")}
              className="bg-blue-50 border border-blue-200 p-4 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif text-blue-700 text-lg">
                    Upgrade to Premium
                  </h3>
                  <p className="text-blue-600 text-sm mt-1">
                    View birth charts and compatibility
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          )}

          {/* Compatibility Score */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-serif text-primary-500 mb-3">Compatibility</h3>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4">
                <div
                  className="bg-primary-500 h-2.5 rounded-full"
                  style={{ width: "78%" }}
                ></div>
              </div>
              <span className="text-primary-500 font-medium">78%</span>
            </div>
            <p className="text-gray-600 text-sm mt-2">
              Based on your preferences and profile details
            </p>
          </div>
        </div>
      </div>

      {/* Chart Modal */}
      {showChartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-serif text-primary-500">
                Birth Chart
              </h3>
              <button
                onClick={() => setShowChartModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {resolvedChartUrl ? (
              <img
                src={resolvedChartUrl} 
                alt="Birth chart"
                className="w-full rounded-lg mb-4"
                onError={(e) => {
                  e.target.src = "/default-chart.png";
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mb-4" />
                <p>No chart available</p>
              </div>
            )}

            <button
              onClick={() => setShowChartModal(false)}
              className="mt-4 w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleProfile;