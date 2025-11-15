import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import SearchBar from '../components/SearchBar';
import { propertiesAPI } from '../services/api';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        const response = await propertiesAPI.getProperties({ limit: 6 });
        
        let properties = [];
        
        if (Array.isArray(response.data)) {
          properties = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          properties = response.data.data;
        } else if (response.data && response.data.properties) {
          properties = response.data.properties;
        } else if (response.data && response.data.results) {
          properties = response.data.results;
        } else {
          properties = response.data || [];
        }
        
        if (!Array.isArray(properties)) {
          properties = [];
        }
        
        setFeaturedProperties(properties);
        setError(null);
        
      } catch  {
        setError('Failed to load properties. Please try again later.');
        setFeaturedProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  const handleSearch = async (searchParams) => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getProperties({
        search: searchParams.destination,
      });
      
      let properties = [];
      
      if (Array.isArray(response.data)) {
        properties = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        properties = response.data.data;
      } else if (response.data && response.data.properties) {
        properties = response.data.properties;
      } else if (response.data && response.data.results) {
        properties = response.data.results;
      } else {
        properties = response.data || [];
      }
      
      if (!Array.isArray(properties)) {
        properties = [];
      }
      
      setFeaturedProperties(properties.slice(0, 3));
      setError(null);
    } catch  {
      setError('Search failed. Please try again.');
      setFeaturedProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const formatLocation = (property) => {
    if (property.location && property.location.address) {
      const { city, state } = property.location.address;
      return `${city}, ${state}`;
    }
    return 'Location not specified';
  };

  const getImageUrl = (property) => {
    if (property.images && property.images.length > 0) {
      return property.images[0].url;
    }
    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
  };

  const getRating = (property) => {
    if (typeof property.rating === 'object' && property.rating !== null) {
      return property.rating.average || 0;
    }
    return property.rating || 0;
  };

  const getReviewCount = (property) => {
    if (typeof property.rating === 'object' && property.rating !== null) {
      return property.rating.count || 0;
    }
    return property.reviews || 0;
  };

  const getPrice = (property) => {
    if (typeof property.price === 'object' && property.price !== null) {
      return property.price.average || property.price || 0;
    }
    return property.price || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <section className="relative h-96 bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto px-4">
            <Motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-white mb-4"
            >
              Find Your Perfect Stay
            </Motion.h1>
            <Motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white mb-8"
            >
              Discover unique accommodations around the world
            </Motion.p>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-7xl mx-auto"
            >
              <SearchBar className="mx-auto" onSearch={handleSearch} />
            </Motion.div>
          </div>
        </section>
        
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading featured properties...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative h-96 bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center max-w-4xl mx-auto px-4">
          <Motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-4"
          >
            Find Your Perfect Stay
          </Motion.h1>
          <Motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white mb-8"
          >
            Discover unique accommodations around the world
          </Motion.p>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            <SearchBar className="mx-auto" onSearch={handleSearch} />
          </Motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Properties</h2>
        
        {error && (
          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </Motion.div>
        )}

        {!Array.isArray(featuredProperties) || featuredProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No properties found.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property, index) => (
              <Motion.div
                key={property._id || property.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <img 
                  src={getImageUrl(property)} 
                  alt={property.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
                  }}
                />
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                  <p className="text-gray-600 text-sm flex items-center mb-2">
                    <FaMapMarkerAlt className="mr-1" />
                    {formatLocation(property)}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="font-semibold">{getRating(property)}</span>
                      <span className="text-gray-500 ml-1">({getReviewCount(property)})</span>
                    </div>
                    <div>
                      <span className="font-bold text-lg">₹{getPrice(property)}</span>
                      <span className="text-gray-500 text-sm">/night</span>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/property/${property._id || property.id}`}
                    className="btn-primary w-full text-center block"
                  >
                    View Details
                  </Link>
                </div>
              </Motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;