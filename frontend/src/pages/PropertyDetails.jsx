import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaHeart, 
  FaShare, 
  FaCheck, 
  FaWifi, 
  FaCar, 
  FaSnowflake,
  FaTv,
  FaUmbrellaBeach,
  FaArrowLeft
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { propertiesAPI } from '../services/api';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await propertiesAPI.getProperty(id);
        
        let propertyData = response.data;
        
        if (propertyData && propertyData.success && propertyData.data) {
          propertyData = propertyData.data;
        }
        
        if (!propertyData || !propertyData._id) {
          throw new Error('Property not found or invalid data structure');
        }
        
        setProperty(propertyData);
        
      } catch (err) {
        let errorMessage = 'Failed to load property details';
        
        if (err.response?.status === 404) {
          errorMessage = 'Property not found';
        } else if (err.response?.status === 400) {
          errorMessage = 'Invalid property ID';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.message) {
          errorMessage = err.message;
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    } else {
      setError('No property ID provided');
      setLoading(false);
    }
  }, [id]);

  const formatLocation = (property) => {
    if (property.location && property.location.address) {
      const { city, state, country } = property.location.address;
      return `${city}, ${state}${country ? `, ${country}` : ''}`;
    }
    return property.location || 'Location not specified';
  };

  const getImageUrl = (image) => {
    if (!image) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
    if (typeof image === 'string') return image;
    return image.url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
  };

  const getPropertyImages = (property) => {
    if (!property) return ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"];
    
    if (property.images && Array.isArray(property.images)) {
      const images = property.images.map(img => getImageUrl(img)).filter(img => img);
      return images.length > 0 ? images : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"];
    }
    
    if (property.image) {
      return [getImageUrl(property.image)];
    }
    
    return ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"];
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

  const getAmenityIcon = (iconName) => {
    const iconMap = {
      wifi: FaWifi,
      parking: FaCar,
      ac: FaSnowflake,
      tv: FaTv,
      pool: FaUmbrellaBeach
    };
    const IconComponent = iconMap[iconName] || FaCheck;
    return <IconComponent />;
  };

  const getAmenitiesDisplay = (property) => {
    if (!property || !property.amenities) return [];
    
    const amenityMap = {
      wifi: { name: "WiFi", icon: "wifi", available: true },
      kitchen: { name: "Kitchen", icon: "kitchen", available: true },
      parking: { name: "Free Parking", icon: "parking", available: true },
      pool: { name: "Swimming Pool", icon: "pool", available: true },
      ac: { name: "Air Conditioning", icon: "ac", available: true },
      tv: { name: "TV", icon: "tv", available: true },
      washingMachine: { name: "Washing Machine", icon: "washing", available: true },
      breakfast: { name: "Breakfast Included", icon: "breakfast", available: true },
      gym: { name: "Gym", icon: "gym", available: true },
      hotTub: { name: "Hot Tub", icon: "hotTub", available: true },
      fireplace: { name: "Fireplace", icon: "fireplace", available: true },
      balcony: { name: "Balcony", icon: "balcony", available: true },
      garden: { name: "Garden", icon: "garden", available: true },
      bbq: { name: "BBQ", icon: "bbq", available: true }
    };

    return property.amenities.map(amenity => amenityMap[amenity] || { 
      name: amenity, 
      icon: amenity, 
      available: true 
    });
  };

  const getHouseRules = (property) => {
    if (!property) return ['No smoking', 'No pets allowed', 'No parties or events'];
    
    const rules = [];
    
    if (property.checkInTime) {
      rules.push(`Check-in: After ${property.checkInTime}`);
    }
    
    if (property.checkOutTime) {
      rules.push(`Check-out: ${property.checkOutTime}`);
    }
    
    if (property.maxGuests) {
      rules.push(`Maximum guests: ${property.maxGuests}`);
    }
    
    if (property.houseRules && Array.isArray(property.houseRules)) {
      rules.push(...property.houseRules);
    } else {
      rules.push('No smoking', 'No pets allowed', 'No parties or events');
    }
    
    return rules;
  };

  const calculateTotalPrice = () => {
    if (!property || !checkInDate || !checkOutDate) return 0;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    const basePrice = getPrice(property) * nights;
    const cleaningFee = 300;
    const serviceFee = 450;
    
    return basePrice + cleaningFee + serviceFee;
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const handleBookNow = () => {
    if (!property) return;
    
    if (!checkInDate || !checkOutDate) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    const nights = calculateNights();
    if (nights <= 0) {
      toast.error('Check-out date must be after check-in date');
      return;
    }
    
    navigate('/payment', { 
      state: { 
        propertyId: property._id || property.id,
        property,
        checkInDate,
        checkOutDate,
        guests
      }
    });
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(!isFavorite ? 'Added to favorites' : 'Removed from favorites');
  };

  const shareProperty = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Property link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaMapMarkerAlt className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const propertyImages = getPropertyImages(property);
  const rating = getRating(property);
  const reviewCount = getReviewCount(property);
  const price = getPrice(property);
  const amenities = getAmenitiesDisplay(property);
  const rules = getHouseRules(property);
  const nights = calculateNights();
  const totalPrice = calculateTotalPrice();

  const hostInfo = property.host || {
    name: 'Host',
    joined: '2020',
    responseRate: '98%',
    responseTime: 'within an hour'
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white z-40 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={shareProperty}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full hover:shadow-md transition-shadow"
              >
                <FaShare className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button
                onClick={toggleFavorite}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-full hover:shadow-md transition-shadow ${
                  isFavorite 
                    ? 'border-red-500 bg-red-50 text-red-500' 
                    : 'border-gray-300'
                }`}
              >
                <FaHeart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl overflow-hidden mb-4"
            >
              <img
                src={getImageUrl(propertyImages[selectedImage])}
                alt={property.title}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
                }}
              />
            </Motion.div>
            
            {propertyImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-4">
                {propertyImages.map((image, index) => (
                  <Motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedImage(index)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${property.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </Motion.button>
                ))}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="font-semibold">{rating}</span>
                    <span className="ml-1">({reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>{formatLocation(property)}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {property.bedrooms || 0} bedrooms • {property.bathrooms || 0} bathrooms
                  </div>
                </div>
              </div>

              <div className="border-t border-b py-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden bg-linear-to-r from-blue-500 to-purple-600">
                    {hostInfo.avatar?.url ? (
                      <img
                        src={hostInfo.avatar.url}
                        alt={hostInfo.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span>{hostInfo.name?.charAt(0) || 'H'}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">Hosted by {hostInfo.name}</h3>
                    <p className="text-sm text-gray-600">
                      {hostInfo.joined && `Joined ${hostInfo.joined}`} · 
                      {hostInfo.responseRate && ` Response rate: ${hostInfo.responseRate}`} · 
                      {hostInfo.responseTime && ` Response time: ${hostInfo.responseTime}`}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">About this place</h2>
                <p className="text-gray-700 leading-relaxed">
                  {property.description || 'No description available.'}
                </p>
              </div>

              {amenities.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          amenity.available ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'
                        }`}>
                          {amenity.available ? <FaCheck className="w-4 h-4" /> : getAmenityIcon(amenity.icon)}
                        </div>
                        <span className={amenity.available ? 'text-gray-700' : 'text-gray-400'}>
                          {amenity.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold mb-4">House rules</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {rules.map((rule, index) => (
                    <div key={index} className="flex items-center space-x-2 text-gray-700">
                      <FaCheck className="w-4 h-4 text-green-600" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24 border border-gray-200 rounded-2xl p-6 shadow-lg bg-white"
            >
              <div className="mb-4">
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold">₹{price}</span>
                  <span className="text-gray-600">night</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <FaStar className="text-yellow-400" />
                  <span className="font-semibold">{rating}</span>
                  <span className="text-gray-600">({reviewCount} reviews)</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-2 border-b border-gray-300">
                    <div className="p-3 border-r border-gray-300">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        CHECK-IN
                      </label>
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full outline-none text-sm"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="p-3">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        CHECK-OUT
                      </label>
                      <input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full outline-none text-sm"
                        min={checkInDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      GUESTS
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full outline-none text-sm"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'guest' : 'guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {nights > 0 && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>₹{price} x {nights} nights</span>
                      <span>₹{price * nights}</span>
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
                )}

                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBookNow}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 text-lg font-semibold rounded-lg transition-colors"
                >
                  Book Now
                </Motion.button>

                <p className="text-center text-sm text-gray-600">
                  You won't be charged yet
                </p>
              </div>
            </Motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;