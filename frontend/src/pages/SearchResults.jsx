import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  FaMapMarkerAlt, 
  FaStar, 
  FaFilter,
  FaTimes,
  FaSort
} from 'react-icons/fa';
import FilterSidebar from '../components/FilterSidebar';
import PropertyCard from '../components/PropertyCard';
import { propertiesAPI } from '../services/api';

const SearchResults = () => {
  const location = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState('grid');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const searchParams = location.state || {};

  const [filters, setFilters] = useState({
    propertyTypes: [],
    amenities: [],
    priceRange: { min: 0, max: 50000 },
    minRating: 0,
    instantBook: false
  });

  const [filteredProperties, setFilteredProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        let apiParams = {};
        if (searchParams.destination) {
          apiParams.search = searchParams.destination;
        }
        
        const response = await propertiesAPI.getProperties(apiParams);
        
        let propertiesData = [];
        
        if (Array.isArray(response.data)) {
          propertiesData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          propertiesData = response.data.data;
        } else if (response.data && Array.isArray(response.data.properties)) {
          propertiesData = response.data.properties;
        } else if (response.data && Array.isArray(response.data.results)) {
          propertiesData = response.data.results;
        } else {
          propertiesData = [];
        }
        
        setProperties(propertiesData);
        setFilteredProperties(propertiesData);
        setError(null);
        
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load properties. Please try again later.';
        setError(errorMessage);
        setProperties([]);
        setFilteredProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams.destination]);

  useEffect(() => {
    if (!Array.isArray(properties) || properties.length === 0) {
      setFilteredProperties([]);
      return;
    }

    let results = [...properties];
    
    if (filters.propertyTypes.length > 0) {
      results = results.filter(property =>
        filters.propertyTypes.includes(property.type)
      );
    }

    if (filters.amenities.length > 0) {
      results = results.filter(property =>
        filters.amenities.every(amenity => 
          property.amenities?.includes(amenity)
        )
      );
    }

    results = results.filter(property => {
      const price = typeof property.price === 'object' ? property.price.average || property.price : property.price;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    if (filters.minRating > 0) {
      results = results.filter(property => {
        const rating = typeof property.rating === 'object' ? property.rating.average || 0 : property.rating || 0;
        return rating >= filters.minRating;
      });
    }

    if (filters.instantBook) {
      results = results.filter(property => property.instantBook);
    }

    switch (sortBy) {
      case 'price-low':
        results.sort((a, b) => {
          const priceA = typeof a.price === 'object' ? a.price.average || a.price : a.price;
          const priceB = typeof b.price === 'object' ? b.price.average || b.price : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        results.sort((a, b) => {
          const priceA = typeof a.price === 'object' ? a.price.average || a.price : a.price;
          const priceB = typeof b.price === 'object' ? b.price.average || b.price : b.price;
          return priceB - priceA;
        });
        break;
      case 'rating':
        results.sort((a, b) => {
          const ratingA = typeof a.rating === 'object' ? a.rating.average || 0 : a.rating || 0;
          const ratingB = typeof b.rating === 'object' ? b.rating.average || 0 : b.rating || 0;
          return ratingB - ratingA;
        });
        break;
      case 'popular':
        results.sort((a, b) => {
          const countA = typeof a.rating === 'object' ? a.rating.count || 0 : 0;
          const countB = typeof b.rating === 'object' ? b.rating.count || 0 : 0;
          return countB - countA;
        });
        break;
      default:
        break;
    }

    setFilteredProperties(results);
  }, [filters, sortBy, properties]);

  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error && (!Array.isArray(properties) || properties.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaMapMarkerAlt className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {searchParams.destination ? `Stays in ${searchParams.destination}` : 'All Stays'}
              </h1>
              <p className="text-gray-600 mt-1">
                {Array.isArray(filteredProperties) ? filteredProperties.length : 0}+ properties found
                {searchParams.startDate && searchParams.endDate && 
                  ` • ${searchParams.startDate} to ${searchParams.endDate}`
                }
                {searchParams.guests && ` • ${searchParams.guests} guests`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                {['grid', 'list'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === mode 
                        ? 'bg-white text-blue-500 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode === 'grid' ? 'Grid' : 'List'}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <FaSort className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-none bg-transparent focus:ring-0 text-sm font-medium"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:shadow-md transition-shadow"
              >
                <FaFilter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block lg:w-80 shrink-0">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
          <AnimatePresence>
            {showFilters && (
              <>
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                />
                <Motion.div
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  className="fixed left-0 top-0 h-full w-80 bg-white z-50 lg:hidden overflow-y-auto"
                >
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <FilterSidebar
                      filters={filters}
                      onFiltersChange={setFilters}
                    />
                  </div>
                </Motion.div>
              </>
            )}
          </AnimatePresence>
          <div className="flex-1">
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {!Array.isArray(filteredProperties) || filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaMapMarkerAlt className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <button
                  onClick={() => setFilters({
                    propertyTypes: [],
                    amenities: [],
                    priceRange: { min: 0, max: 50000 },
                    minRating: 0,
                    instantBook: false
                  })}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-6'
              }>
                {filteredProperties.map((property, index) => (
                  <PropertyCard
                    key={property._id || property.id || index}
                    property={property}
                    viewMode={viewMode}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;