import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { FaStar, FaMapMarkerAlt, FaHeart, FaBolt } from 'react-icons/fa'

const PropertyCard = ({ property, viewMode = 'grid', index = 0 }) => {
  const [isFavorite, setIsFavorite] = useState(false)

  const toggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const formatLocation = (property) => {
    if (property.location && property.location.address) {
      const { city, state } = property.location.address
      return `${city}, ${state}`
    }
    return 'Location not specified'
  }

  const getImageUrl = (property) => {
    if (property.images && property.images.length > 0) {
      return property.images[0].url
    }
    return property.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"
  }
  const getRating = (property) => {
    if (typeof property.rating === 'object' && property.rating !== null) {
      return property.rating.average || 0
    }
    return property.rating || 0
  }
  const getReviewCount = (property) => {
    if (typeof property.rating === 'object' && property.rating !== null) {
      return property.rating.count || 0
    }
    return property.reviews || 0
  }
  const getPrice = (property) => {
    if (typeof property.price === 'object' && property.price !== null) {
      return property.price.average || property.price || 0
    }
    return property.price || 0
  }

  if (viewMode === 'list') {
    const ratingValue = getRating(property)
    const reviewCount = getReviewCount(property)
    const priceValue = getPrice(property)

    return (
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
      >
        <Link to={`/property/${property._id || property.id}`} className="flex flex-col md:flex-row">
          <div className="md:w-64 h-48 md:h-auto relative">
            <img
              src={getImageUrl(property)}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"
              }}
            />
            <button
              onClick={toggleFavorite}
              className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              <FaHeart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            </button>
            {property.superHost && (
              <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-semibold">
                🌟 Superhost
              </div>
            )}
          </div>
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {property.title}
                </h3>
                <p className="text-gray-600 flex items-center">
                  <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                  {formatLocation(property)}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 mb-1">
                  <FaStar className="text-yellow-400" />
                  <span className="font-semibold">{ratingValue}</span>
                  {reviewCount > 0 && (
                    <span className="text-gray-500 ml-1">({reviewCount})</span>
                  )}
                </div>
                <div className="text-lg font-bold">₹{priceValue}<span className="text-gray-600 text-sm font-normal">/night</span></div>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
              {property.instantBook && (
                <div className="flex items-center space-x-1">
                  <FaBolt className="text-green-500" />
                  <span>Instant Book</span>
                </div>
              )}
              <span>•</span>
              <span className="capitalize">{property.type}</span>
            </div>

            <p className="text-gray-700 line-clamp-2 mb-4">
              {property.description || 'Beautiful property with amazing views and modern amenities. Perfect for a relaxing getaway.'}
            </p>

            <div className="flex flex-wrap gap-2">
              {property.amenities?.slice(0, 4).map(amenity => (
                <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
                  {amenity.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              ))}
              {property.amenities?.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{property.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        </Link>
      </Motion.div>
    )
  }
  const ratingValue = getRating(property)
  const reviewCount = getReviewCount(property)
  const priceValue = getPrice(property)

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
    >
      <Link to={`/property/${property._id || property.id}`}>
        <div className="relative">
          <img
            src={getImageUrl(property)}
            alt={property.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"
            }}
          />
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <FaHeart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
          </button>
          {property.superHost && (
            <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-semibold">
              🌟 Superhost
            </div>
          )}
          {property.instantBook && (
            <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
              <FaBolt className="w-3 h-3" />
              <span>Instant Book</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg truncate mr-2">{property.title}</h3>
            <div className="flex items-center space-x-1 shrink-0">
              <FaStar className="text-yellow-400" />
              <span className="font-semibold">{ratingValue}</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm flex items-center mb-2">
            <FaMapMarkerAlt className="w-3 h-3 mr-1" />
            {formatLocation(property)}
          </p>

          <p className="text-gray-500 text-sm mb-3 capitalize">
            {property.type} • {property.instantBook ? 'Instant Book' : 'Request to Book'}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-lg font-bold">₹{priceValue}<span className="text-gray-600 text-sm font-normal">/night</span></div>
            {reviewCount > 0 && (
              <span className="text-gray-500 text-sm">{reviewCount} reviews</span>
            )}
          </div>
        </div>
      </Link>
    </Motion.div>
  )
}

export default PropertyCard