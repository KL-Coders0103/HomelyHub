import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { FaLock, FaCheck, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { bookingsAPI } from '../services/api';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    if (location.state) {
      setBookingData(location.state);
    } else {
      toast.error('No booking information found');
      navigate('/');
    }
  }, [location.state, navigate]);

  const calculateTotalPrice = () => {
    if (!bookingData?.property || !bookingData?.checkInDate || !bookingData?.checkOutDate) {
      return 0;
    }
    
    const property = bookingData.property;
    const priceValue = typeof property.price === 'number' ? property.price : property.price?.average || 0;
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    const basePrice = priceValue * nights;
    const cleaningFee = 300;
    const serviceFee = 450;
    
    return basePrice + cleaningFee + serviceFee;
  };

  const handlePayment = async () => {
    if (!bookingData) {
      toast.error('Booking information missing');
      return;
    }

    setIsProcessing(true);
    
    try {
      const bookingPayload = {
        propertyId: bookingData.propertyId || bookingData.property._id,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        guests: {
          adults: bookingData.guests || 1,
          children: 0,
          infants: 0
        },
        specialRequests: '' 
      };
      
      const response = await bookingsAPI.createBooking(bookingPayload);

      let booking = null;
      
      if (response.data && response.data.data) {
        booking = response.data.data;
      } else if (response.data) {
        booking = response.data;
      }

      if (!booking) {
        throw new Error('Booking creation failed - no booking data returned');
      }

      const bookingId = booking._id || booking.id;
      
      if (bookingId) {
        toast.success('Payment successful! Booking confirmed.');
        navigate(`/booking/${bookingId}`);
      } else {
        const alternativeId = response.data?._id || booking.data?._id;
        
        if (alternativeId) {
          toast.success('Payment successful! Booking confirmed.');
          navigate(`/booking/${alternativeId}`);
        } else {
          toast.success('Payment successful! Check your bookings for details.');
          navigate('/profile');
        }
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Payment failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatLocation = (property) => {
    if (property.location && property.location.address) {
      const { city, state } = property.location.address;
      return `${city}, ${state}`;
    }
    return property.location || 'Location not specified';
  };

  const getImageUrl = (property) => {
    if (property.images && property.images.length > 0) {
      return property.images[0].url;
    }
    return property.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400";
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking information...</p>
        </div>
      </div>
    );
  }

  const property = bookingData.property;
  const totalPrice = calculateTotalPrice();
  const nights = bookingData.checkInDate && bookingData.checkOutDate 
    ? Math.ceil((new Date(bookingData.checkOutDate) - new Date(bookingData.checkInDate)) / (1000 * 60 * 60 * 24))
    : 0;
  const priceValue = typeof property.price === 'number' 
    ? property.price 
    : property.price?.average || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mr-4"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Complete your booking</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-6"
            >
              <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {['card', 'paypal', 'upi', 'netbanking'].map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      paymentMethod === method 
                        ? 'border-primary bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium capitalize">{method}</div>
                  </button>
                ))}
              </div>
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 1234 1234 1234"
                      className="input-field"
                      maxLength={19}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="input-field"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="CVC"
                        className="input-field"
                        maxLength={3}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Full name on card"
                      className="input-field"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center mt-6 p-4 bg-green-50 rounded-lg">
                <FaLock className="text-green-600 mr-3" />
                <span className="text-sm text-green-800">
                  Your payment is secure and encrypted
                </span>
              </div>
            </Motion.div>
          </div>
          <div className="lg:col-span-1">
            <Motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="sticky top-8 bg-white rounded-2xl shadow-lg overflow-hidden"
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
                <h3 className="font-semibold text-lg mb-2">
                  {property.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {formatLocation(property)}
                </p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in</span>
                    <span>{bookingData.checkInDate ? new Date(bookingData.checkInDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out</span>
                    <span>{bookingData.checkOutDate ? new Date(bookingData.checkOutDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests</span>
                    <span>{bookingData.guests || 1} guests</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights</span>
                    <span>{nights} nights</span>
                  </div>
                </div>

                <hr className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>₹{priceValue} x {nights} nights</span>
                    <span>₹{priceValue * nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cleaning fee</span>
                    <span>₹300</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>₹450</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </div>
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayment}
                  disabled={isProcessing || !bookingData.checkInDate || !bookingData.checkOutDate}
                  className="w-full btn-primary py-4 mt-6 text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Pay - ₹${totalPrice}`
                  )}
                </Motion.button>

                <p className="text-center text-xs text-gray-500 mt-3">
                  <FaLock className="inline w-3 h-3 mr-1" />
                  Secure payment encrypted
                </p>
              </div>
            </Motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;