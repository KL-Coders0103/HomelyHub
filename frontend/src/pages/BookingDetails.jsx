import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { 
  FaCheck, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaUser,
  FaStar,
  FaDownload,
  FaShare,
  FaArrowLeft
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { bookingsAPI } from '../services/api';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id || id === 'undefined' || id === 'null') {
        const bookingIdFromState = location.state?.bookingId || location.state?.booking?._id;
        
        if (bookingIdFromState) {
          navigate(`/booking/${bookingIdFromState}`, { replace: true });
          return;
        }
        
        setError('Invalid booking URL. Please check your booking link.');
        setLoading(false);
        toast.error('Invalid booking URL');
        return;
      }

      try {
        setLoading(true);
        
        const response = await bookingsAPI.getBooking(id);

        let bookingData = response.data;
        
        if (bookingData && bookingData.data) {
          bookingData = bookingData.data;
        } else if (bookingData && bookingData.booking) {
          bookingData = bookingData.booking;
        }
        
        if (!bookingData) {
          throw new Error('Booking not found in response');
        }
        
        setBooking(bookingData);
        setError(null);
        
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load booking details.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, navigate, location.state]);

  const formatLocation = (property) => {
    if (!property) return 'Location not specified';
    if (property.location && property.location.address) {
      const { city, state } = property.location.address;
      return `${city}, ${state}`;
    }
    return property.location || 'Location not specified';
  };

  const getImageUrl = (property) => {
    if (!property) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
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

  const getPrice = (property) => {
    if (!property) return 0;
    if (typeof property.price === 'object' && property.price !== null) {
      return property.price.average || property.price || 0;
    }
    return property.price || 0;
  };

  const handleDownloadInvoice = () => {
    toast.success('Invoice downloaded successfully!');
  };

  const handleShareBooking = () => {
    if (booking && booking._id) {
      navigator.clipboard.writeText(`${window.location.origin}/booking/${booking._id}`);
      toast.success('Booking link copied to clipboard!');
    } else {
      toast.error('Cannot share: Booking ID not available');
    }
  };

  const calculateNights = () => {
    if (!booking?.checkInDate || !booking?.checkOutDate) return 0;
    
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const getBookingStatus = () => {
    if (!booking) return 'confirmed';
    return booking.bookingStatus || booking.status || 'confirmed';
  };

  const getPaymentStatus = () => {
    if (!booking) return 'paid';
    return booking.paymentStatus || 'paid';
  };

  const getBookingGuests = () => {
    if (!booking) return { adults: 1, children: 0, infants: 0 };
    
    if (typeof booking.guests === 'object' && booking.guests !== null) {
      return {
        adults: booking.guests.adults || 1,
        children: booking.guests.children || 0,
        infants: booking.guests.infants || 0
      };
    }
    
    return {
      adults: booking.guests || 1,
      children: 0,
      infants: 0
    };
  };

  const getBookingTotal = () => {
    if (!booking) return 0;
    return booking.totalAmount || booking.amount || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
          {id && id !== 'undefined' && (
            <p className="text-sm text-gray-500 mt-2">Booking ID: {id}</p>
          )}
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCalendarAlt className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {id === 'undefined' ? 'Invalid Booking URL' : 'Booking Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {id === 'undefined' 
              ? 'The booking URL appears to be invalid. Please check your link or go to your profile to view bookings.'
              : error
            }
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/profile')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              View My Bookings
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const property = booking.property || {};
  const nights = calculateNights();
  const basePrice = getPrice(property) * nights;
  const totalPrice = getBookingTotal() || (basePrice + 300 + 450);
  const bookingStatus = getBookingStatus();
  const paymentStatus = getPaymentStatus();
  const guests = getBookingGuests();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate(`/profile`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mr-4"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-gray-600">Booking ID: {booking._id?.slice(-8).toUpperCase() || 'N/A'}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:shadow-md transition-shadow"
            >
              <FaDownload className="w-4 h-4" />
              <span>Invoice</span>
            </button>
            <button
              onClick={handleShareBooking}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:shadow-md transition-shadow"
            >
              <FaShare className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Booking {bookingStatus === 'cancelled' ? 'Cancelled' : 'Confirmed'}
                  </h2>
                  <p className="text-gray-600">
                    Your booking at {property?.title || 'the property'} has been {bookingStatus === 'cancelled' ? 'cancelled' : 'confirmed'}
                  </p>
                </div>
                <div className={`flex items-center space-x-2 ${
                  bookingStatus === 'confirmed' ? 'text-green-600' : 
                  bookingStatus === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  <FaCheck className="w-6 h-6" />
                  <span className="font-semibold capitalize">{bookingStatus}</span>
                </div>
              </div>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={getImageUrl(property)}
                    alt={property?.title || 'Property'}
                    className="w-full md:w-48 h-40 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="text-xl font-bold mb-2">{property?.title || 'Property'}</h4>
                    <p className="text-gray-600 flex items-center mb-3">
                      <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                      {formatLocation(property)}
                    </p>
                    <p className="text-gray-600 mb-4">
                      Hosted by {property?.host?.name || 'Host'}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span>{getRating(property)} ({getReviewCount(property)} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Booking Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaCalendarAlt className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Check-in</label>
                      <p className="font-semibold">
                        {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaCalendarAlt className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Check-out</label>
                      <p className="font-semibold">
                        {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaUser className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Guests</label>
                      <p className="font-semibold">
                        {guests.adults} {guests.adults === 1 ? 'guest' : 'guests'}
                        {guests.children > 0 ? `, ${guests.children} children` : ''}
                        {guests.infants > 0 ? `, ${guests.infants} infants` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaCheck className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Booked On</label>
                      <p className="font-semibold">
                        {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {booking.specialRequests && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Special Requests</h4>
                  <p className="text-gray-700">{booking.specialRequests}</p>
                </div>
              )}
            </Motion.div>
          </div>

          <div className="lg:col-span-1">
            <Motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
            >
              <h3 className="text-lg font-semibold mb-4">Price Details</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>₹{getPrice(property)} x {nights} nights</span>
                  <span>₹{basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>₹300</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>₹450</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>

              <div className={`mt-6 p-4 rounded-lg ${
                paymentStatus === 'paid' ? 'bg-green-50' : 
                paymentStatus === 'pending' ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                <p className={`text-sm text-center ${
                  paymentStatus === 'paid' ? 'text-green-800' : 
                  paymentStatus === 'pending' ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  <FaCheck className="inline w-4 h-4 mr-1" />
                  {paymentStatus === 'paid' ? `Paid on ${booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}` :
                   paymentStatus === 'pending' ? 'Payment Pending' :
                   'Payment Failed'}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold mb-3">Need Help?</h4>
                <div className="space-y-2 text-sm">
                  <button className="w-full text-left text-blue-600 hover:text-blue-800">
                    Contact Host
                  </button>
                  <button className="w-full text-left text-blue-600 hover:text-blue-800">
                    HomelyHub Support
                  </button>
                  {bookingStatus !== 'cancelled' && (
                    <button className="w-full text-left text-red-600 hover:text-red-800">
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </Motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;