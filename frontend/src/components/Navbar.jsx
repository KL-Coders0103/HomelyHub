import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { 
  FaUser, 
  FaBars, 
  FaTimes,
  FaSignOutAlt,
  FaHome
} from 'react-icons/fa';
import { useAuth } from '../context/useAuth';
import SearchBar from './SearchBar';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  const handleUserMenuClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
      if (isMenuOpen && !event.target.closest('.mobile-menu')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isMenuOpen]);

  return (
    <Motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-lg sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold text-blue-500"
            >
              HomelyHub
            </Motion.div>
          </Link>
          <div className="hidden lg:block flex-1 max-w-2xl mx-8">
            <SearchBar variant="compact" />
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated && (
              <Link 
                to="/accommodation" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Become a Host
              </Link>
            )}
            <div className="relative user-menu">
              <button 
                onClick={handleUserMenuClick}
                className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 hover:shadow-md transition-shadow"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden bg-linear-to-r from-blue-500 to-purple-600">
                {isAuthenticated && user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : isAuthenticated && user ? (
                  <span>{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                ) : (
                  <FaUser className="w-4 h-4" />
                )}
              </div>
              </button>
              
              {isUserMenuOpen && (
                <Motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                >
                  {!isAuthenticated ? (
                    <>
                      <Link 
                        to="/login" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaUser className="w-4 h-4 mr-2" />
                        Login
                      </Link>
                      <Link 
                        to="/signup" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaUser className="w-4 h-4 mr-2" />
                        Sign Up
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Hello, {user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      <Link 
                        to="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaUser className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                      
                      {(user.role === 'host' || user.role === 'admin') && (
                        <Link 
                          to="/my-accommodations" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaHome className="w-4 h-4 mr-2" />
                          My Accommodations
                        </Link>
                      )}
                      
                      <Link 
                        to="/accommodation" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaHome className="w-4 h-4 mr-2" />
                        List Your Property
                      </Link>
                      
                      <hr className="my-2" />
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <FaSignOutAlt className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </>
                  )}
                </Motion.div>
              )}
            </div>
          </div>
          <div className="lg:hidden flex items-center space-x-4">
            {isAuthenticated && (
              <div className="user-menu">
                <button 
                  onClick={handleUserMenuClick}
                  className="flex items-center border border-gray-300 rounded-full p-2 hover:shadow-md transition-shadow"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden bg-linear-to-r from-blue-500 to-purple-600">
                    {user?.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </div>
                </button>
              </div>
            )}
            <button 
              className="mobile-menu p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>
        <div className="lg:hidden pb-4">
          <SearchBar variant="compact" />
        </div>
        {isMenuOpen && (
          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t mobile-menu z-40"
          >
            <div className="px-4 py-2 space-y-2">
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/login" 
                    className="block py-3 text-gray-700 hover:text-blue-500 transition-colors border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block py-3 text-gray-700 hover:text-blue-500 transition-colors border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <div className="px-2 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Hello, {user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    {user.role && (
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                        {user.role}
                      </span>
                    )}
                  </div>
                  
                  <Link 
                    to="/profile" 
                    className="block py-3 text-gray-700 hover:text-blue-500 transition-colors border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  
                  {(user.role === 'host' || user.role === 'admin') && (
                    <Link 
                      to="/my-accommodations" 
                      className="block py-3 text-gray-700 hover:text-blue-500 transition-colors border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Accommodations
                    </Link>
                  )}
                  
                  <Link 
                    to="/accommodation" 
                    className="block py-3 text-gray-700 hover:text-blue-500 transition-colors border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    List Your Property
                  </Link>
                </>
              )}
              
              <Link 
                to={isAuthenticated ? "/accommodation" : "/login"} 
                className="block py-3 text-gray-700 hover:text-blue-500 transition-colors border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Become a Host
              </Link>
              
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-3 text-red-600 hover:text-red-700 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </Motion.div>
        )}
      </div>
    </Motion.nav>
  );
};

export default Navbar;