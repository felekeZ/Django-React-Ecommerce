import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { removeToken, isAuthenticated, checkAndRefreshToken } from "../utils/auth";

function Navbar() {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  // Check token validity every minute
  useEffect(() => {
    const checkToken = async () => {
      const isValid = await checkAndRefreshToken();
      if (!isValid) {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(isAuthenticated());
      }
    };

    // Check immediately
    checkToken();

    // Check every minute
    const interval = setInterval(checkToken, 840000); // 14 minutes

    return () => clearInterval(interval);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(isAuthenticated());
    };

    // Check immediately
    handleAuthChange();

    // Listen for custom auth events
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('unauthorized', handleAuthChange);
    window.addEventListener('storage', handleAuthChange); // For multi-tab support

    // Also check on focus (user returning to tab)
    window.addEventListener('focus', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('unauthorized', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('focus', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    removeToken(); // This dispatches 'auth-change' event
    navigate("/login");
    setIsMenuOpen(false);
  };

  const handleNavigation = () => {
    setIsMenuOpen(false);
  };

  // Safely calculate cart count
  const cartCount = cartItems.reduce((total, item) => {
    const quantity = item.quantity || 1;
    return total + quantity;
  }, 0);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg py-3"
          : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-5"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo with Animation */}
          <Link to="/" className="group relative" onClick={handleNavigation}>
            <div className="flex items-center gap-3">
              <div
                className={`relative transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 ${
                  scrolled ? "text-indigo-600" : "text-white"
                }`}
              >
                <svg
                  className="w-9 h-9"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-full blur-xl transition-opacity duration-500"></div>
              </div>
              <span
                className={`relative inline-flex items-center text-2xl font-extrabold tracking-tight transition-all duration-500 ${
                  scrolled
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                    : "text-white"
                }`}
              >
                {/* Animated gradient overlay */}
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></span>

                {/* Main logo text with hover effect */}
                <span className="relative group cursor-pointer">
                  <span className={`relative z-10 ${scrolled ? "text-indigo-600" : "text-white"}`}>
                    Feleke
                    <span
                      className={`inline-block transition-all duration-300 ${
                        scrolled
                          ? "text-indigo-600 group-hover:scale-110"
                          : "text-yellow-300 group-hover:text-yellow-200"
                      }`}
                    >
                      C
                    </span>
                    ommerce
                  </span>

                  {/* Animated underline */}
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                      scrolled
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                        : "bg-white"
                    }`}
                  ></span>
                </span>

                {/* Small decorative elements */}
                <span className="ml-1 inline-flex">
                  <span
                    className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      scrolled ? "bg-indigo-600" : "bg-white"
                    }`}
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full animate-pulse mx-0.5 ${
                      scrolled ? "bg-purple-600" : "bg-white"
                    }`}
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      scrolled ? "bg-pink-600" : "bg-white"
                    }`}
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </span>
              </span>
            </div>
          </Link>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Button with Tooltip */}
            <div className="relative group">
              <button
                className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                  scrolled
                    ? "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                    : "text-white hover:bg-white/20"
                }`}
                aria-label="Search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Search
              </span>
            </div>

            {/* Cart Icon with Animation */}
            <Link
              to="/cart"
              className={`relative p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 group ${
                scrolled
                  ? "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  : "text-white hover:bg-white/20"
              }`}
              onClick={handleNavigation}
            >
              <svg
                className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-bounce shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu / Auth Buttons */}
            <div className="hidden md:block">
              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium text-sm tracking-wide cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className={`px-5 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm tracking-wide ${
                      scrolled
                        ? "text-indigo-600 hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-200"
                        : "text-white hover:bg-white/20 border-2 border-transparent hover:border-white/30"
                    }`}
                    onClick={handleNavigation}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl font-medium text-sm tracking-wide border-2 border-transparent hover:border-indigo-200"
                    onClick={handleNavigation}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button with Animation */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2.5 rounded-xl transition-all duration-300 ${
                scrolled
                  ? "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  : "text-white hover:bg-white/20"
              }`}
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <svg
                  className="w-6 h-6 transform transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu with Smooth Animation */}
        <div
          className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${
            isMenuOpen ? "max-h-96 mt-4 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className={`rounded-2xl p-4 ${
              scrolled
                ? "bg-white shadow-2xl border border-gray-100"
                : "bg-white/10 backdrop-blur-xl border border-white/20"
            }`}
          >
            <div className="flex flex-col space-y-2">
              {/* Decorative Divider */}
              <div
                className={`h-px w-full my-2 ${
                  scrolled
                    ? "bg-gradient-to-r from-transparent via-gray-200 to-transparent"
                    : "bg-gradient-to-r from-transparent via-white/30 to-transparent"
                }`}
              ></div>

              {isLoggedIn ? (
                <>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium text-sm tracking-wide hover:shadow-lg transition-all duration-300 transform active:scale-95"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className={`w-full px-4 py-3 text-center rounded-xl font-medium text-sm tracking-wide transition-all duration-300 transform active:scale-95 ${
                      scrolled
                        ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-2 border-indigo-100"
                        : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20"
                    }`}
                    onClick={handleNavigation}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`w-full px-4 py-3 text-center rounded-xl font-medium text-sm tracking-wide transition-all duration-300 transform active:scale-95 ${
                      scrolled
                        ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-2 border-indigo-100"
                        : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20"
                    }`}
                    onClick={handleNavigation}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;