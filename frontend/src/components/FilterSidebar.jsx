import React, { useState } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { FaChevronDown, FaChevronUp, FaRupeeSign } from 'react-icons/fa'

const FilterSidebar = ({ filters, onFiltersChange, className = '' }) => {
  const [openSections, setOpenSections] = useState({
    price: true,
    type: true,
    amenities: true,
    rating: true
  })

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const propertyTypes = [
    { id: 'apartment', label: 'Apartment', count: 124 },
    { id: 'house', label: 'House', count: 89 },
    { id: 'villa', label: 'Villa', count: 45 },
    { id: 'cottage', label: 'Cottage', count: 32 },
    { id: 'farmhouse', label: 'Farmhouse', count: 18 }
  ]

  const amenitiesList = [
    { id: 'wifi', label: 'WiFi' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'parking', label: 'Free Parking' },
    { id: 'pool', label: 'Swimming Pool' },
    { id: 'ac', label: 'Air Conditioning' },
    { id: 'tv', label: 'TV' },
    { id: 'washingMachine', label: 'Washing Machine' },
    { id: 'breakfast', label: 'Breakfast Included' }
  ]

  const ratings = [
    { value: 4.5, label: '4.5+ (Excellent)' },
    { value: 4.0, label: '4.0+ (Very Good)' },
    { value: 3.5, label: '3.5+ (Good)' },
    { value: 3.0, label: '3.0+ (Average)' }
  ]

  const handlePriceChange = (min, max) => {
    onFiltersChange({
      ...filters,
      priceRange: { min, max }
    })
  }

  const handleTypeToggle = (typeId) => {
    const newTypes = filters.propertyTypes.includes(typeId)
      ? filters.propertyTypes.filter(id => id !== typeId)
      : [...filters.propertyTypes, typeId]
    
    onFiltersChange({
      ...filters,
      propertyTypes: newTypes
    })
  }

  const handleAmenityToggle = (amenityId) => {
    const newAmenities = filters.amenities.includes(amenityId)
      ? filters.amenities.filter(id => id !== amenityId)
      : [...filters.amenities, amenityId]
    
    onFiltersChange({
      ...filters,
      amenities: newAmenities
    })
  }

  const handleRatingChange = (rating) => {
    onFiltersChange({
      ...filters,
      minRating: rating
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      propertyTypes: [],
      amenities: [],
      priceRange: { min: 0, max: 50000 },
      minRating: 0,
      instantBook: false 
    })
  }

  return (
    <Motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={clearAllFilters}
          className="text-primary hover:text-red-600 text-sm font-medium"
        >
          Clear all
        </button>
      </div>

      <div className="border-b border-gray-200 pb-6 mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex justify-between items-center w-full text-left"
        >
          <h4 className="font-semibold text-gray-900">Price Range</h4>
          {openSections.price ? (
            <FaChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <FaChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        <AnimatePresence>
          {openSections.price && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Min: ₹{filters.priceRange.min}</span>
                    <span className="text-gray-600">Max: ₹{filters.priceRange.max}</span>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      step="500"
                      value={filters.priceRange.min}
                      onChange={(e) => handlePriceChange(parseInt(e.target.value), filters.priceRange.max)}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { min: 0, max: 2000, label: 'Under ₹2k' },
                    { min: 2000, max: 5000, label: '₹2k-5k' },
                    { min: 5000, max: 10000, label: '₹5k-10k' },
                    { min: 10000, max: 50000, label: 'Over ₹10k' }
                  ].map((range, index) => (
                    <button
                      key={index}
                      onClick={() => handlePriceChange(range.min, range.max)}
                      className={`p-2 text-xs border rounded-lg text-center transition-colors ${
                        filters.priceRange.min === range.min && filters.priceRange.max === range.max
                          ? 'border-primary bg-red-50 text-primary'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="border-b border-gray-200 pb-6 mb-6">
        <button
          onClick={() => toggleSection('type')}
          className="flex justify-between items-center w-full text-left"
        >
          <h4 className="font-semibold text-gray-900">Property Type</h4>
          {openSections.type ? (
            <FaChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <FaChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        <AnimatePresence>
          {openSections.type && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              {propertyTypes.map(type => (
                <label key={type.id} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={filters.propertyTypes.includes(type.id)}
                      onChange={() => handleTypeToggle(type.id)}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{type.label}</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {type.count}
                  </span>
                </label>
              ))}
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-b border-gray-200 pb-6 mb-6">
        <button
          onClick={() => toggleSection('amenities')}
          className="flex justify-between items-center w-full text-left"
        >
          <h4 className="font-semibold text-gray-900">Amenities</h4>
          {openSections.amenities ? (
            <FaChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <FaChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        <AnimatePresence>
          {openSections.amenities && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              {amenitiesList.map(amenity => (
                <label key={amenity.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity.id)}
                    onChange={() => handleAmenityToggle(amenity.id)}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{amenity.label}</span>
                </label>
              ))}
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="border-b border-gray-200 pb-6 mb-6">
        <button
          onClick={() => toggleSection('rating')}
          className="flex justify-between items-center w-full text-left"
        >
          <h4 className="font-semibold text-gray-900">Guest Rating</h4>
          {openSections.rating ? (
            <FaChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <FaChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        <AnimatePresence>
          {openSections.rating && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              {ratings.map(rating => (
                <label key={rating.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === rating.value}
                    onChange={() => handleRatingChange(rating.value)}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{rating.label}</span>
                </label>
              ))}
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">Instant Book</h4>
          <p className="text-xs text-gray-600">Book without waiting for host approval</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filters.instantBook}
            onChange={(e) => onFiltersChange({ ...filters, instantBook: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
    </Motion.div>
  )
}

export default FilterSidebar