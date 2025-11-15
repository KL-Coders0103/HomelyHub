import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaHome, 
  FaEdit, 
  FaKey,
  FaSignOutAlt,
  FaStar,
  FaEye,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/useAuth';
import { bookingsAPI } from '../services/api';
import { useProperty } from '../context/useProperty';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { hostProperties, fetchHostProperties } = useProperty();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const bookingsResponse = await bookingsAPI.getBookings();
        
        let userBookings = [];
        if (Array.isArray(bookingsResponse.data)) {
          userBookings = bookingsResponse.data;
        } else if (bookingsResponse.data && Array.isArray(bookingsResponse.data.data)) {
          userBookings = bookingsResponse.data.data;
        } else if (bookingsResponse.data && Array.isArray(bookingsResponse.data.bookings)) {
          userBookings = bookingsResponse.data.bookings;
        } else if (bookingsResponse.data && Array.isArray(bookingsResponse.data.results)) {
          userBookings = bookingsResponse.data.results;
        }
        
        setBookings(userBookings);
        
      } catch  {
        toast.error('Failed to load user data');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'accommodations' && user) {
      const fetchAccommodations = async () => {
        try {
          await fetchHostProperties();
        } catch  {
          toast.error('Failed to load accommodations');
        }
      };
      fetchAccommodations();
    }
  }, [activeTab, user, fetchHostProperties]);

  const getRating = useCallback((property) => {
    if (!property || !property.rating) return 0;
    if (typeof property.rating === 'object') {
      return property.rating.average || 0;
    }
    return Number(property.rating) || 0;
  }, []);

  const getReviewCount = useCallback((property) => {
    if (!property || !property.rating) return 0;
    if (typeof property.rating === 'object') {
      return property.rating.count || 0;
    }
    return Number(property.reviews) || 0;
  }, []);

  const getPrice = useCallback((property) => {
    if (!property) return 0;
    if (typeof property.price === 'object') {
      return property.price.average || property.price || 0;
    }
    return Number(property.price) || 0;
  }, []);

  const formatLocation = useCallback((property) => {
    if (!property) return 'Location not specified';
    if (property.location && property.location.address) {
      const { city, state } = property.location.address;
      if (city && state) return `${city}, ${state}`;
      if (city) return city;
      if (state) return state;
    }
    return property.location || 'Location not specified';
  }, []);

  const getImageUrl = useCallback((property) => {
    if (!property) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
    if (property.images && property.images.length > 0) {
      const firstImage = property.images[0];
      return firstImage.url || firstImage;
    }
    return property.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
  }, []);

  const calculateEarnings = useCallback((accommodation) => {
    if (!accommodation) return 0;
    const price = getPrice(accommodation);
    const bookingCount = accommodation.bookingCount || 0;
    return price * bookingCount;
  }, [getPrice]);

  const handleLogout = useCallback(() => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
  }, [logout, navigate]);

  const getBookingStatus = useCallback((booking) => {
    if (!booking) return 'confirmed';
    return booking.bookingStatus || booking.status || 'confirmed';
  }, []);

  const getBookingTotal = useCallback((booking) => {
    if (!booking) return 0;
    return booking.totalAmount || booking.amount || getPrice(booking.property) || 0;
  }, [getPrice]);

  const getBookingGuests = useCallback((booking) => {
    if (!booking) return 1;
    if (typeof booking.guests === 'object' && booking.guests !== null) {
      return booking.guests.adults || 1;
    }
    return booking.guests || 1;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 overflow-hidden bg-linear-to-r from-blue-500 to-purple-600">
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
                    <span>{user?.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <h3 className="font-semibold text-lg">{user?.name}</h3>
                <p className="text-gray-600 text-sm">{user?.email}</p>
                {user?.role && (
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                    {user.role}
                  </span>
                )}
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'My Profile', icon: FaUser },
                  { id: 'bookings', label: 'My Bookings', icon: FaCalendarAlt },
                  { id: 'accommodations', label: 'My Accommodations', icon: FaHome }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <Link
                  to="/update-profile"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FaEdit className="w-5 h-5" />
                  <span className="font-medium">Edit Profile</span>
                </Link>
                <button className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full text-left">
                  <FaKey className="w-5 h-5" />
                  <span className="font-medium">Change Password</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <FaSignOutAlt className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </Motion.div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                  <Link
                    to="/update-profile"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <FaEdit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <p className="text-lg font-semibold">{user?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <p className="text-lg">{user?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <p className="text-lg">{user?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Member Since
                      </label>
                      <p className="text-lg">
                        {user?.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            })
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{bookings.length}</div>
                    <div className="text-gray-600">Total Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">{hostProperties.length}</div>
                    <div className="text-gray-600">Listed Properties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {hostProperties.length > 0 
                        ? (hostProperties.reduce((acc, accm) => acc + getRating(accm), 0) / hostProperties.length).toFixed(1)
                        : '0.0'
                      }
                    </div>
                    <div className="text-gray-600">Average Rating</div>
                  </div>
                </div>
              </Motion.div>
            )}

            {activeTab === 'bookings' && (
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
                
                {!Array.isArray(bookings) || bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600 mb-6">Start exploring and book your first stay!</p>
                    <button 
                      onClick={() => navigate('/')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Explore Properties
                    </button>
                  </div>
                ) : (
                  bookings.map((booking, index) => (
                    <Motion.div
                      key={booking._id || booking.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <img
                            src={getImageUrl(booking.property)}
                            alt={booking.property?.title}
                            className="w-full md:w-48 h-40 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="text-xl font-semibold">{booking.property?.title}</h3>
                                <p className="text-gray-600 flex items-center mt-1">
                                  <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                                  {formatLocation(booking.property)}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                getBookingStatus(booking) === 'confirmed' 
                                  ? 'bg-green-100 text-green-800'
                                  : getBookingStatus(booking) === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {getBookingStatus(booking).charAt(0).toUpperCase() + getBookingStatus(booking).slice(1)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <label className="text-gray-600">Check-in</label>
                                <p className="font-semibold">
                                  {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <label className="text-gray-600">Check-out</label>
                                <p className="font-semibold">
                                  {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <label className="text-gray-600">Guests</label>
                                <p className="font-semibold">
                                  {getBookingGuests(booking)} guests
                                </p>
                              </div>
                              <div>
                                <label className="text-gray-600">Total</label>
                                <p className="font-semibold">₹{getBookingTotal(booking)}</p>
                              </div>
                            </div>

                            <div className="flex space-x-3 mt-4">
                              <button
                                onClick={() => navigate(`/booking/${booking._id || booking.id}`)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                              >
                                View Details
                              </button>
                              {getBookingStatus(booking) === 'confirmed' && (
                                <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                                  Modify Booking
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Motion.div>
                  ))
                )}
              </Motion.div>
            )}

            {activeTab === 'accommodations' && (
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">My Accommodations</h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {hostProperties.length} propert{hostProperties.length === 1 ? 'y' : 'ies'} listed
                    </span>
                    <Link
                      to="/accommodation"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <FaHome className="w-4 h-4" />
                      <span>Add New Place</span>
                    </Link>
                  </div>
                </div>

                {!hostProperties || hostProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <FaHome className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No accommodations listed</h3>
                    <p className="text-gray-600 mb-6">Start hosting and list your first property!</p>
                    <Link
                      to="/accommodation"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      List Your Property
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {hostProperties.map((accommodation, index) => (
                      <Motion.div
                        key={accommodation._id || accommodation.id || `acc-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
                      >
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-48 h-40 shrink-0">
                              <img
                                src={getImageUrl(accommodation)}
                                alt={accommodation.title || 'Property image'}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
                                }}
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-xl font-semibold text-gray-900 truncate">
                                    {accommodation.title || 'Untitled Property'}
                                  </h3>
                                  <p className="text-gray-600 flex items-center mt-1">
                                    <FaMapMarkerAlt className="w-4 h-4 mr-1 shrink-0" />
                                    <span className="truncate">{formatLocation(accommodation)}</span>
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium shrink-0 ml-4 ${
                                  (accommodation.isActive !== false && accommodation.status !== 'inactive') 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {(accommodation.isActive !== false && accommodation.status !== 'inactive') ? 'Active' : 'Inactive'}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                <div className="flex items-center">
                                  <FaStar className="text-yellow-400 mr-1 shrink-0" />
                                  <span className="font-semibold">{getRating(accommodation)}</span>
                                  <span className="text-gray-500 ml-1">
                                    ({getReviewCount(accommodation)})
                                  </span>
                                </div>
                                <div>
                                  <label className="text-gray-600 block">Price</label>
                                  <p className="font-semibold">₹{getPrice(accommodation)}/night</p>
                                </div>
                                <div>
                                  <label className="text-gray-600 block">Type</label>
                                  <p className="font-semibold capitalize">
                                    {accommodation.type || 'Not specified'}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-gray-600 block">Earnings</label>
                                  <p className="font-semibold">₹{calculateEarnings(accommodation)}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-3">
                                <button 
                                  onClick={() => navigate(`/property/${accommodation._id || accommodation.id}`)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                                >
                                  <FaEye className="w-3 h-3" />
                                  <span>View Listing</span>
                                </button>
                                <button 
                                  onClick={() => navigate(`/accommodation/edit/${accommodation._id || accommodation.id}`)}
                                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                                >
                                  <FaEdit className="w-3 h-3" />
                                  <span>Edit Property</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Motion.div>
                    ))}
                  </div>
                )}
              </Motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;