import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { 
  FaHome, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaMapMarkerAlt,
  FaStar,
  FaCalendarAlt,
  FaRupeeSign
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useProperty } from '../context/useProperty';
import { useAuth } from '../context/useAuth';

const MyAccommodations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hostProperties, deleteProperty, fetchHostProperties, loading } = useProperty();
  const [accommodations, setAccommodations] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      if (user) {
        try {
          await fetchHostProperties();
        } catch {
          toast.error('Failed to load accommodations');
        }
      }
    };

    fetchProperties();
  }, [user, fetchHostProperties]);

  useEffect(() => {
    if (hostProperties && Array.isArray(hostProperties)) {
      if (hostProperties.length > 0) {
        setAccommodations(hostProperties);
      } else {
        setAccommodations([]);
      }
    } else {
      setAccommodations([]);
    }
  }, [hostProperties]);

  const handleEdit = (id) => {
    if (!id || id === 'undefined' || id === 'null') {
      toast.error('Invalid property ID');
      return;
    }
    
    const propertyExists = accommodations.some(acc => acc._id === id);
    
    if (!propertyExists) {
      toast.error('Property not found. Please refresh the page and try again.');
      return;
    }
    
    navigate(`/accommodation/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this accommodation? This action cannot be undone.')) {
      try {
        const result = await deleteProperty(id);
        if (result.success) {
          toast.success('Accommodation deleted successfully');
          await fetchHostProperties();
        }
      } catch {
        toast.error('Failed to delete accommodation');
      }
    }
  };

  const handleView = (id) => {
    navigate(`/property/${id}`);
  };

  const getStatusColor = (status) => {
    if (status === true || status === 'active') {
      return 'bg-green-100 text-green-800';
    } else if (status === false || status === 'inactive') {
      return 'bg-gray-100 text-gray-800';
    } else if (status === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (property) => {
    if (property.isActive !== undefined) {
      return property.isActive ? 'Active' : 'Inactive';
    }
    return property.status ? property.status.charAt(0).toUpperCase() + property.status.slice(1) : 'Inactive';
  };

  const formatLocation = (property) => {
    if (property.location && property.location.address) {
      const { city, state } = property.location.address;
      return `${city}, ${state}`;
    }
    return property.location || 'Location not specified';
  };

  const formatAddress = (property) => {
    if (property.location && property.location.address) {
      const { street, city, state, pincode } = property.location.address;
      return `${street ? street + ', ' : ''}${city}, ${state}, ${pincode}`;
    }
    return 'Address not specified';
  };

  const getImageUrl = (property) => {
    if (property.images && property.images.length > 0) {
      return property.images[0].url || property.images[0];
    }
    return property.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
  };

  const getRating = (property) => {
    if (!property) return 0;
    if (typeof property.rating === 'object' && property.rating !== null) {
      return property.rating.average || 0;
    }
    return property.rating || 0;
  };

  const getReviewCount = (property) => {
    if (!property) return 0;
    if (typeof property.rating === 'object' && property.rating !== null) {
      return property.rating.count || 0;
    }
    return property.reviews || 0;
  };

  const calculateEarnings = (property) => {
    const bookingCount = property.bookingCount || 0;
    const price = property.price || 0;
    return price * bookingCount;
  };

  const totalBookings = accommodations.reduce((sum, acc) => sum + (acc.bookingCount || 0), 0);
  const totalEarnings = accommodations.reduce((sum, acc) => sum + calculateEarnings(acc), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your accommodations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Accommodations</h1>
            <p className="text-gray-600">Manage your listed properties</p>
          </div>
          <Link
            to="/accommodation"
            className="btn-primary flex items-center space-x-2"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add New Place</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{accommodations.length}</div>
            <div className="text-gray-600">Total Listings</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {accommodations.filter(a => a.isActive !== false && a.status !== 'inactive').length}
            </div>
            <div className="text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">{totalBookings}</div>
            <div className="text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              ₹{totalEarnings.toLocaleString()}
            </div>
            <div className="text-gray-600">Total Earnings</div>
          </div>
        </div>

        <div className="space-y-6">
          {accommodations && accommodations.length > 0 ? (
            accommodations.map((accommodation, index) => (
              <Motion.div
                key={accommodation._id || accommodation.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <img
                      src={getImageUrl(accommodation)}
                      alt={accommodation.title}
                      className="w-full lg:w-64 h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {accommodation.title}
                          </h3>
                          <p className="text-gray-600 flex items-center mb-1">
                            <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                            {formatLocation(accommodation)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatAddress(accommodation)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(accommodation.isActive !== undefined ? accommodation.isActive : accommodation.status)}`}>
                          {getStatusText(accommodation)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div className="flex items-center">
                          <FaRupeeSign className="w-4 h-4 text-green-600 mr-1" />
                          <span className="font-semibold">₹{accommodation.price || 0}</span>
                          <span className="text-gray-600 ml-1">/night</span>
                        </div>
                        <div className="flex items-center">
                          <FaStar className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="font-semibold">{getRating(accommodation) || 'New'}</span>
                          {getRating(accommodation) > 0 && (
                            <span className="text-gray-600 ml-1">({getReviewCount(accommodation)} reviews)</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <FaCalendarAlt className="w-4 h-4 text-blue-600 mr-1" />
                          <span className="font-semibold">{accommodation.bookingCount || 0}</span>
                          <span className="text-gray-600 ml-1">bookings</span>
                        </div>
                        <div className="flex items-center">
                          <FaHome className="w-4 h-4 text-purple-600 mr-1" />
                          <span className="font-semibold">{accommodation.maxGuests || 1}</span>
                          <span className="text-gray-600 ml-1">guests max</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <label className="text-gray-600">Check-in</label>
                            <p className="font-semibold">{accommodation.checkInTime || '14:00'}</p>
                          </div>
                          <div>
                            <label className="text-gray-600">Check-out</label>
                            <p className="font-semibold">{accommodation.checkOutTime || '12:00'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleView(accommodation._id || accommodation.id)}
                          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <FaEye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        <button 
                          onClick={() => {
                            if (accommodations.length === 0) {
                              toast.error('No properties available to edit');
                              return;
                            }
                            
                            if (!accommodation._id) {
                              toast.error('Invalid property ID');
                              return;
                            }
                            
                            handleEdit(accommodation._id);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <FaEdit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(accommodation._id || accommodation.id)}
                          className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <FaTrash className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Motion.div>
            ))
          ) : (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <FaHome className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No accommodations listed yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start sharing your space with travelers around the world
              </p>
              <Link
                to="/accommodation"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <FaPlus className="w-4 h-4" />
                <span>List Your First Property</span>
              </Link>
            </Motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAccommodations;