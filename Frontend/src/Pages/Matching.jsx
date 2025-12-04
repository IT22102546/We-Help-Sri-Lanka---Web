import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

function Matching() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    caste: "",
    starSign: "",
    eatingHabit: "",
    maritalStatus: "",
    religion: "",
    minAge: "",
    maxAge: "",
    countryOfResidence: "",
    member_id:""
  });
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Image handling configuration
  const imageBaseUrls = [
    'https://api.viwahaa.com/uploads/',
    'https://mobile.viwahaa.com/uploads/'
  ];
  const defaultImage = "https://w7.pngwing.com/pngs/81/570/png-transparent-profile-logo-computer-icons-user-user-blue-heroes-logo-thumbnail.png";

  // Helper function to get proper image URL
  const getProfileImageUrl = (profile) => {
    if (!profile?.profile_img) return defaultImage;
    if (profile.profile_img.includes('http')) return profile.profile_img;
    return imageBaseUrls[0] + profile.profile_img;
  };

  // Set initial form data from user preferences
  useEffect(() => {
    if (currentUser?.user?.id) {
      setFormData(prev => ({
        ...prev,
        religion: currentUser.user.partner_religion || "",
        starSign: currentUser.user.partner_star_sign || "",
        caste: currentUser.user.partner_cast || "",
        eatingHabit: currentUser.user.partner_eating_habit || "",
        minAge: currentUser.user.partner_minimum_age || "",
        maxAge: currentUser.user.partner_maximum_age || ""
      }));
    }
  }, [currentUser]);

  // Handle view profile click based on package plan
  const handleViewProfile = (profileId) => {
    if (currentUser?.user?.package_plan === "Basic Plan") {
      navigate('/pricing');
    } else {
      navigate(`/single-profile/${profileId}`);
    }
  };

  // Fetch matching profiles
  const fetchMatchingProfiles = useCallback(async (signal) => {
    if (!currentUser?.user?.id) return;

    setLoading(true);
    setError(null);
    
    const targetGender = currentUser?.user?.gender === "male" ? "female" : "male";

    try {
      const response = await fetch(
        `/api/user/matchingusers?userId=${currentUser.user.id}&gender=${targetGender}&page=${page}&limit=${limit}`,
        { signal }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const receivedProfiles = Array.isArray(data) ? data : (data.data || []);
      
      setProfiles(prev => {
        if (page === 1) return receivedProfiles;
        const existingIds = new Set(prev.map(p => p.id));
        const newProfiles = receivedProfiles.filter(p => !existingIds.has(p.id));
        return [...prev, ...newProfiles];
      });
      
      setHasMore(receivedProfiles.length === limit);
      if (page === 1) setInitialLoadComplete(true);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Fetch Error:", error);
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser?.user?.id, currentUser?.user?.gender, page, limit]);

  useEffect(() => {
    const controller = new AbortController();
    fetchMatchingProfiles(controller.signal);
    return () => controller.abort();
  }, [fetchMatchingProfiles]);

  // Infinite scroll implementation
  useEffect(() => {
    if (!initialLoadComplete || loading || !hasMore) return;

    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 500 >= 
        document.documentElement.offsetHeight
      ) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initialLoadComplete, loading, hasMore]);

  // Filter profiles based on form data
  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      // Star Sign filter
      if (formData.starSign && formData.starSign.toLowerCase() !== "any" && profile.starSign !== formData.starSign)
        return false;
      
      // Religion filter
      if (formData.religion && formData.religion.toLowerCase() !== "any" && profile.religion !== formData.religion)
        return false;
      
      // Caste filter
      if (formData.caste && formData.caste.toLowerCase() !== "any" && profile.caste !== formData.caste)
        return false;
      
      // Eating Habit filter
      if (formData.eatingHabit && formData.eatingHabit.toLowerCase() !== "any" && profile.eatingHabit !== formData.eatingHabit)
        return false;
      
      // Marital Status filter
      if (formData.maritalStatus && formData.maritalStatus.toLowerCase() !== "any" && profile.maritalStatus !== formData.maritalStatus)
        return false;

       if (formData.member_id && formData.member_id.toLowerCase() !== "any" && profile.member_id !== formData.member_id)
        return false;
      
      // Age filters
      if (formData.minAge && profile.age < parseInt(formData.minAge))
        return false;
      if (formData.maxAge && profile.age > parseInt(formData.maxAge))
        return false;
      
      // Country filter
      if (
        formData.countryOfResidence &&
        !profile.countryOfResidence
          ?.toLowerCase()
          .includes(formData.countryOfResidence.toLowerCase())
      )
        return false;
      
      return true;
    });
  }, [profiles, formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setInitialLoadComplete(false);
  };

  const resetFilters = () => {
    setFormData({
      caste: currentUser?.user?.partner_cast || "",
      starSign: currentUser?.user?.partner_star_sign || "",
      eatingHabit: currentUser?.user?.partner_eating_habit || "",
      maritalStatus: "",
      religion: currentUser?.user?.partner_religion || "",
      minAge: currentUser?.user?.partner_minimum_age || "",
      maxAge: currentUser?.user?.partner_maximum_age || "",
      countryOfResidence: "",
    });
    setPage(1);
    setInitialLoadComplete(false);
  };

  const shouldShowProfileImage = () => {
    return currentUser?.user?.package_plan === "Ultimate Plan";
  };

  const isBasicPlan = currentUser?.user?.package_plan === "Basic Plan";

  // Skeleton loader for profiles
  const ProfileSkeleton = () => (
    <div className="profile-card border border-gray-200 p-4 sm:p-5 rounded-lg shadow-sm bg-white">
      <div className="profile-image mb-3 sm:mb-4 flex justify-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gray-200 animate-pulse"></div>
      </div>
      <div className="profile-info space-y-1 sm:space-y-2">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="mt-3 sm:mt-4 h-8 bg-gray-300 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="matching-page px-4 sm:px-6 lg:px-8 xl:px-20 py-4 sm:py-6 lg:py-8 xl:py-10 max-w-7xl mx-auto">
      <div className="filter-section mb-6 sm:mb-8 lg:mb-10">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-workSans mb-3 sm:mb-4 lg:mb-5 text-center sm:text-left">
          Filter Profiles
        </h2>
        
        <form 
          onSubmit={handleSubmit} 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
        >
          {/* Star Sign */}
          <div className="filter-column">
            <label className="block text-sm sm:text-base font-workSans text-gray-700 mb-1 sm:mb-2">
              Star Sign
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-orange-500 focus:border-orange-500"
              name="starSign"
              value={formData.starSign}
              onChange={handleInputChange}
            >
              <option value="">Select Star Sign</option>
              <option value="any">Any Star Sign</option>
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
            </select>
          </div>

          {/* Religion */}
          <div className="filter-column">
            <label className="block text-sm sm:text-base font-workSans text-gray-700 mb-1 sm:mb-2">
              Religion
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-orange-500 focus:border-orange-500"
              name="religion"
              value={formData.religion}
              onChange={handleInputChange}
            >
              <option value="">Select Religion</option>
              <option value="any">Any Religion</option>
              <option value="hindu">Hindu</option>
              <option value="christian">Christian</option>
              <option value="muslim">Muslim</option>
              <option value="buddhist">Buddhist</option>
              <option value="sikh">Sikh</option>
              <option value="jewish">Jewish</option>
            </select>
          </div>

          {/* Caste */}
          <div className="filter-column">
            <label className="block text-sm sm:text-base font-workSans text-gray-700 mb-1 sm:mb-2">
              Caste
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-orange-500 focus:border-orange-500"
              name="caste"
              value={formData.caste}
              onChange={handleInputChange}
            >
              <option value="">Select Caste</option>
              <option value="any">Any Caste</option>
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
            </select>
          </div>

          {/* Eating Habit */}
          <div className="filter-column">
            <label className="block text-sm sm:text-base font-workSans text-gray-700 mb-1 sm:mb-2">
              Eating Habit
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-orange-500 focus:border-orange-500"
              name="eatingHabit"
              value={formData.eatingHabit}
              onChange={handleInputChange}
            >
              <option value="">Select Eating Habit</option>
              <option value="any">Any Eating Habit</option>
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

          {/* Marital Status */}
          <div className="filter-column">
            <label className="block text-sm sm:text-base font-workSans text-gray-700 mb-1 sm:mb-2">
              Marital Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-orange-500 focus:border-orange-500"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleInputChange}
            >
              <option value="">Select Marital Status</option>
              <option value="any">Any Marital Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="separated">Separated</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>

          {/* Min Age */}
          <div className="filter-column">
            <label className="block text-sm sm:text-base font-workSans text-gray-700 mb-1 sm:mb-2">
              Minimum Age
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-orange-500 focus:border-orange-500"
              type="number"
              name="minAge"
              value={formData.minAge}
              onChange={handleInputChange}
              placeholder="Min age"
              min="18"
            />
          </div>

          {/* Max Age */}
          <div className="filter-column">
            <label className="block text-sm sm:text-base font-workSans text-gray-700 mb-1 sm:mb-2">
              Maximum Age
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-orange-500 focus:border-orange-500"
              type="number"
              name="maxAge"
              value={formData.maxAge}
              onChange={handleInputChange}
              placeholder="Max age"
              min="18"
            />
          </div>

          {/* Country of Residence */}
          <div className="filter-column">
            <label className="block text-sm sm:text-base font-workSans text-gray-700 mb-1 sm:mb-2">
              Country of Residence
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-orange-500 focus:border-orange-500"
              type="text"
              name="countryOfResidence"
              value={formData.countryOfResidence}
              onChange={handleInputChange}
              placeholder="Country"
            />
          </div>

          {/* Apply Filter and Reset Buttons */}
          <div className="col-span-full mt-3 sm:mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              className="flex-1 px-4 sm:px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="flex-1 px-4 sm:px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Reset to Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Displaying Matching Profiles */}
      <div className="profiles-section">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-workSans mb-4 sm:mb-6 text-center">
          Matching Profiles
        </h2>
        
        {error && (
          <div className="text-center py-4 bg-red-100 text-red-700 rounded-lg mb-4">
            Error loading profiles: {error}
          </div>
        )}

        {!initialLoadComplete && loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => <ProfileSkeleton key={i} />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProfiles.length === 0 && !loading ? (
                <div className="col-span-full text-center py-8 sm:py-10 text-gray-500">
                  No matching profiles found. Try adjusting your filters.
                </div>
              ) : (
                filteredProfiles.map((profile) => (
                  <div
                    key={profile.id || profile._id}
                    className="profile-card border border-gray-200 p-4 sm:p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 bg-white"
                  >
                    <div className="profile-image mb-3 sm:mb-4 flex justify-center">
                      {shouldShowProfileImage() ? (
                        <img
                          src={getProfileImageUrl(profile)}
                          alt={profile.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-full border-2 border-orange-500"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            if (!profile.profile_img?.includes('http') && 
                                !e.target.src.includes(imageBaseUrls[1])) {
                              e.target.src = imageBaseUrls[1] + (profile.profile_img || '');
                            } else {
                              e.target.src = defaultImage;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs text-center">
                            Upgrade to Ultimate Plan to view photos
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="profile-info space-y-1 sm:space-y-2">
                      <p className="text-base sm:text-lg font-semibold text-center text-gray-800">
                        {currentUser?.user?.package_plan === "Ultimate Plan" 
                          ? profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Name not available'
                          : currentUser?.user?.gender === "male" ? "Bride" : "Groom"
                        }
                      </p>

                      <p className="text-xs sm:text-sm text-gray-600 text-center">
                        {profile.age} years old
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                         <span className="font-medium">Member ID:</span> {profile.member_id}
                      </p>
                      
                      {!isBasicPlan && (
                        <>
                          
                          {profile.starSign && (
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                              <span className="font-medium">Star:</span> {profile.starSign}
                            </p>
                          )}
                          {profile.religion && (
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                              <span className="font-medium">Religion:</span> {profile.religion}
                            </p>
                          )}
                          {profile.caste && (
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                              <span className="font-medium">Caste:</span> {profile.caste}
                            </p>
                          )}
                          {profile.countryOfResidence && (
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                              <span className="font-medium">Location:</span> {profile.countryOfResidence}
                            </p>
                          )}
                          {(profile.occupation || profile.occupation_details) && (
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                              <span className="font-medium">Occupation:</span> {profile.occupation || profile.occupation_details}
                            </p>
                          )}
                        </>
                      )}
                      
                      <div className="mt-3 sm:mt-4">
                        <button
                          onClick={() => handleViewProfile(profile.id)}
                          className="block w-full px-4 sm:px-6 py-1 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs sm:text-sm text-center font-medium"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {loading && initialLoadComplete && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-4">
                {[...Array(4)].map((_, i) => <ProfileSkeleton key={`loading-${i}`} />)}
              </div>
            )}

            {!hasMore && initialLoadComplete && filteredProfiles.length > 0 && (
              <div className="text-center mt-6 text-gray-500">
                No more profiles to load
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Matching;