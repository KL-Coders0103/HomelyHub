import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUser } from 'react-icons/fa';

const SearchBar = ({ variant = 'default', className = '', onSearch }) => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    guests: 1
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = {
      destination: searchData.destination,
      startDate: searchData.startDate,
      endDate: searchData.endDate,
      guests: searchData.guests
    };
    if (onSearch) {
      onSearch(searchParams);
    } else {
      if (!searchData.destination) {
        navigate('/search');
      } else {
        navigate('/search', { 
          state: searchParams
        });
      }
    }
  };

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (variant === 'compact') {
    return (
      <Motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-full shadow-lg border border-gray-200 ${className}`}
      >
        <div className="flex items-center divide-x divide-gray-200">
          <div className="flex-1 px-6 py-4">
            <div className="flex items-center space-x-3">
              <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations"
                value={searchData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                className="w-full outline-none text-sm placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex-1 px-6 py-4">
            <div className="flex items-center space-x-3">
              <FaCalendarAlt className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={searchData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full outline-none text-sm"
              />
            </div>
          </div>
          <div className="flex-1 px-6 py-4">
            <div className="flex items-center space-x-3">
              <FaUser className="w-4 h-4 text-gray-400" />
              <select
                value={searchData.guests}
                onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                className="w-full outline-none text-sm bg-transparent"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="px-2">
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              className="bg-primary text-white p-3 rounded-full hover:bg-red-600 transition-colors"
            >
              <FaSearch className="w-4 h-4" />
            </Motion.button>
          </div>
        </div>
      </Motion.div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-xl p-2 ${className}`}
    >
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center">
        <div className="flex-1 p-4 border-r border-gray-200">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            WHERE
          </label>
          <div className="flex items-center space-x-3">
            <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search destinations"
              value={searchData.destination}
              onChange={(e) => handleInputChange('destination', e.target.value)}
              className="w-full outline-none text-lg placeholder-gray-500"
            />
          </div>
        </div>
        <div className="flex-1 p-4 border-r border-gray-200">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            CHECK-IN
          </label>
          <div className="flex items-center space-x-3">
            <FaCalendarAlt className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={searchData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="w-full outline-none text-lg"
            />
          </div>
        </div>
        <div className="flex-1 p-4 border-r border-gray-200">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            CHECK-OUT
          </label>
          <div className="flex items-center space-x-3">
            <FaCalendarAlt className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={searchData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="w-full outline-none text-lg"
            />
          </div>
        </div>
        <div className="flex-1 p-4 border-r border-gray-200">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            GUESTS
          </label>
          <div className="flex items-center space-x-3">
            <FaUser className="w-4 h-4 text-gray-400" />
            <select
              value={searchData.guests}
              onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
              className="w-full outline-none text-lg bg-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'guest' : 'guests'}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-2">
          <Motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-primary text-white px-8 py-4 rounded-xl hover:bg-red-600 transition-colors flex items-center space-x-2 text-lg font-semibold"
          >
            <FaSearch className="w-5 h-5" />
            <span>Search</span>
          </Motion.button>
        </div>
      </form>
    </Motion.div>
  );
};

export default SearchBar;