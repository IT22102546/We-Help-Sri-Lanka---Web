import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "../redux/user/userSlice";
import homeTile from '../assets/images/homeTile.jpg';
import logo from '../assets/Logo/logowhite.png';
import service from '../assets/images/service.jpg';

function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.user) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case "/about":
        return "About Us";
      case "/services":
        return "Services";
      case "/pricing":
        return "Pricing Plans";
      case "/contact":
        return "Contact Us";
      case "/sign-in":
        return "Login";
      case "/customer-profile":
        return "Viwahaa Matrimony";
      case "/":
      case "/home":
        return "";
      default:
        return "Viwahaa Matrimony";
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    dispatch(signOut());
    navigate("/sign-in");
  };

  return (
    <header
      className={`relative h-[80vh] sm:h-[90vh] bg-cover bg-center transition-all duration-500 ${
        scrolled && location.pathname === "/" ? "h-[70vh] sm:h-[80vh]" : ""
      }`}
      style={{
        backgroundImage: `url(${location.pathname === "/services" || location.pathname === "/about" ? service : homeTile})`,
        backgroundPosition: location.pathname === "/services" || location.pathname === "/about"  ? "center top" : "center"
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Navbar */}
      <nav className={`absolute top-0 left-0 w-full px-4 sm:px-6 md:px-12 lg:px-52 py-4 sm:py-6 md:py-12 flex justify-between items-center z-10 transition-all duration-300`}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 sm:gap-2">
          <img
            src={logo}
            alt="logo"
            className={`h-12 w-12 sm:h-14 sm:w-14 md:h-[68px] md:w-[68px] transition-all duration-300 ${
              scrolled ? "h-10 w-10 sm:h-12 sm:w-12" : ""
            }`}
          />
          <h1 className={`font-Sacremento text-2xl sm:text-3xl md:text-4xl font-normal text-white transition-all duration-300 ${
            scrolled ? "text-xl sm:text-2xl" : ""
          }`}>
            Viwahaa
          </h1>
        </Link>

        {/* Nav Links (for large screens) */}
        <ul className="hidden md:flex space-x-4 lg:space-x-6 text-white font-normal text-sm md:text-[14px] tracking-wide">
          <Link to="/">
            <li className="hover:text-pink-300 cursor-pointer px-2 py-1">HOME</li>
          </Link>
          <Link to="/about">
            <li className="hover:text-pink-300 cursor-pointer px-2 py-1">ABOUT</li>
          </Link>
          <Link to="/services">
            <li className="hover:text-pink-300 cursor-pointer px-2 py-1">SERVICES</li>
          </Link>
          <Link to="/pricing">
            <li className="hover:text-pink-300 cursor-pointer px-2 py-1">PRICING</li>
          </Link>
          <Link to="/contact">
            <li className="hover:text-pink-300 cursor-pointer px-2 py-1">CONTACT</li>
          </Link>
          {currentUser?.user ? (
            <Link to="/customer-profile">
              <li className="hover:text-pink-300 cursor-pointer px-2 py-1">PROFILE</li>
            </Link>
          ) : (
            <Link to="/sign-in">
              <li className="hover:text-pink-300 cursor-pointer px-2 py-1">LOGIN</li>
            </Link>
          )}
        </ul>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={toggleMenu} 
          className="md:hidden text-white p-1"
          aria-label="Toggle menu"
        >
          <Menu size={28} />
        </button>
      </nav>

      {/* Sidebar Menu (for mobile) */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-20 flex justify-end md:hidden">
          <div className="w-4/5 sm:w-72 bg-black h-full px-4 sm:px-6 py-8">
            <button
              onClick={toggleMenu}
              className="text-white absolute top-4 right-4 p-1"
              aria-label="Close menu"
            >
              <X size={32} />
            </button>
            <ul className="flex flex-col items-start space-y-6 mt-12 text-white font-semibold text-lg sm:text-xl">
              <Link to="/" onClick={toggleMenu} className="w-full">
                <li className="hover:bg-gray-800 w-full px-4 py-2 rounded">HOME</li>
              </Link>
              <Link to="/about" onClick={toggleMenu} className="w-full">
                <li className="hover:bg-gray-800 w-full px-4 py-2 rounded">ABOUT</li>
              </Link>
              <Link to="/services" onClick={toggleMenu} className="w-full">
                <li className="hover:bg-gray-800 w-full px-4 py-2 rounded">SERVICES</li>
              </Link>
              <Link to="/pricing" onClick={toggleMenu} className="w-full">
                <li className="hover:bg-gray-800 w-full px-4 py-2 rounded">PRICING</li>
              </Link>
              <Link to="/contact" onClick={toggleMenu} className="w-full">
                <li className="hover:bg-gray-800 w-full px-4 py-2 rounded">CONTACT</li>
              </Link>
              {currentUser?.user ? (
                <>
                  <Link to="/customer-profile" onClick={toggleMenu} className="w-full">
                    <li className="hover:bg-gray-800 w-full px-4 py-2 rounded">PROFILE</li>
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="hover:bg-gray-800 w-full text-left px-4 py-2 rounded"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link to="/sign-in" onClick={toggleMenu} className="w-full">
                  <li className="hover:bg-gray-800 w-full px-4 py-2 rounded">LOGIN</li>
                </Link>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Conditional Content for Home Page */}
      {location.pathname === "/" && (
        <div className={`absolute bottom-10 sm:bottom-20 left-1/2 transform -translate-x-1/2 z-10 text-center text-white px-4 sm:px-6 md:px-12 w-full transition-all duration-500 ${
          scrolled ? "bottom-1/2 -translate-y-1/2" : ""
        }`}>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-[75px] font-normal font-Sacremento mb-3 sm:mb-4 transition-all duration-500 ${
            scrolled ? "text-2xl sm:text-3xl md:text-4xl mb-2" : ""
          }`}>
            This is where you meet your life partner
          </h2>
          <p className={`text-base sm:text-lg mb-4 sm:mb-6 font-workSans max-w-2xl mx-auto transition-all duration-500 ${
            scrolled ? "text-sm sm:text-base mb-3 opacity-90" : ""
          }`}>
            We verify every profile manually so that you know you are dealing
            with real people.
          </p>
          <div className={`flex flex-col gap-3 items-center justify-center md:flex-row md:gap-5 transition-all duration-500 ${
            scrolled ? "scale-90" : ""
          }`}>
            {!currentUser?.user ? (
              <>
                <Link to="/sign-up" className="w-full sm:w-auto">
                  <button className="bg-orange-500 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-orange-600 font-workSans w-full sm:w-auto">
                    REGISTER
                  </button>
                </Link>
                <Link to="/sign-in" className="w-full sm:w-auto">
                  <button className="bg-transparent border-2 border-white text-white px-4 sm:px-6 py-2 rounded-full hover:bg-white hover:border-orange-600 hover:text-black font-workSans w-full sm:w-auto">
                    LOGIN
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/customer-profile" className="w-full sm:w-auto">
                  <button className="bg-orange-500 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-orange-600 font-workSans w-full sm:w-auto">
                    Go to Profile
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-transparent border-2 border-white text-white px-4 sm:px-6 py-2 rounded-full hover:bg-white hover:border-orange-600 hover:text-black font-workSans w-full sm:w-auto"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Centered Title */}
      {location.pathname !== "/" && (
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full px-4 text-center transition-all duration-300 ${
          scrolled ? "top-1/3" : ""
        }`}>
          <h1 className={`text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-CretinaBold transition-all duration-300 font-Sacremento ${
            scrolled ? "text-3xl sm:text-4xl md:text-5xl" : ""
          }`}>
            {getPageTitle(location.pathname)}
          </h1>
          {/* Member ID display for profile page */}
          {location.pathname === "/customer-profile" && currentUser?.user?.member_id && (
            <p className="text-white text-lg sm:text-xl mt-2 font-workSans">
              Member ID: {currentUser.user.member_id}
            </p>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;