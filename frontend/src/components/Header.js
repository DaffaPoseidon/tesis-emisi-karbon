import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../images/Logo-Polinema.webp";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      setIsLoggedIn(true);
      setUserRole(user.role);
      setUserName(`${user.firstName || ""} ${user.lastName || ""}`.trim());
    } else {
      setIsLoggedIn(false);
      setUserRole("");
      setUserName("");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserRole("");
    setUserName("");
    setDropdownOpen(false);
    navigate("/login");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={Logo} alt="Polinema Logo" className="h-10 w-10" />
            <span className="ml-2 text-xl font-bold text-green-600">
              Carbon Credits
            </span>
          </Link>

          <nav className="hidden md:flex space-x-6 items-center">
            <Link
              to="/"
              className="text-gray-700 hover:text-green-600 transition duration-150"
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className="text-gray-700 hover:text-green-600 transition duration-150"
            >
              Marketplace
            </Link>

            {/* Register Validator link in main navigation - only for superadmin */}
            {isLoggedIn && userRole === "superadmin" && (
              <Link
                to="/register-validator"
                className="text-gray-700 hover:text-green-600 transition duration-150"
              >
                Register Validator
              </Link>
            )}

            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center text-gray-700 hover:text-green-600 focus:outline-none"
                >
                  <span className="mr-1">{userName}</span>
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20">
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-gray-700 hover:bg-green-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Account
                    </Link>

                    {userRole === "seller" && (
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-gray-700 hover:bg-green-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}

                    {/* Removed Register Validator from dropdown since it's now in main nav */}

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition duration-150"
                >
                  Login
                </Link>
                <Link
                  to="/register-user"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-150"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">{/* Implement mobile menu here */}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
