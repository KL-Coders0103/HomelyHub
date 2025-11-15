import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import { motion as Motion } from 'framer-motion';
import { 
  FaHome, 
  FaMapMarkerAlt, 
  FaUpload, 
  FaArrowLeft,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useProperty } from '../context/useProperty';
import { useAuth } from '../context/useAuth';
import { uploadAPI } from '../services/api';

const EditAccommodation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { updateProperty, fetchHostProperties, loading } = useProperty();
  const [property, setProperty] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: {
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      }
    },
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    amenities: [],
    price: '',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    houseRules: ''
  });

  const amenitiesList = [
    'wifi', 'kitchen', 'parking', 'pool', 'ac', 'tv', 
    'washingMachine', 'breakfast', 'gym', 'hotTub', 
    'fireplace', 'balcony', 'garden', 'bbq'
  ];

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'villa', label: 'Villa' },
    { value: 'cottage', label: 'Cottage' },
    { value: 'farmhouse', label: 'Farmhouse' },
    { value: 'studio', label: 'Studio' }
  ];

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setUploading(true);
        
        const response = await propertiesAPI.getProperty(id);
        
        let propertyData = response.data;
        
        if (propertyData && propertyData.success) {
          if (propertyData.data) {
            propertyData = propertyData.data;
          } else {
            throw new Error('Property data not found in response');
          }
        }
        
        if (!propertyData || !propertyData._id) {
          throw new Error('Property not found');
        }
        
        setProperty(propertyData);
        
        setFormData({
          title: propertyData.title || '',
          description: propertyData.description || '',
          location: propertyData.location || {
            address: {
              street: '',
              city: '',
              state: '',
              pincode: ''
            }
          },
          type: propertyData.type || 'apartment',
          bedrooms: propertyData.bedrooms || 1,
          bathrooms: propertyData.bathrooms || 1,
          maxGuests: propertyData.maxGuests || 2,
          amenities: propertyData.amenities || [],
          price: propertyData.price?.toString() || '',
          checkInTime: propertyData.checkInTime || '14:00',
          checkOutTime: propertyData.checkOutTime || '12:00',
          houseRules: Array.isArray(propertyData.houseRules) 
            ? propertyData.houseRules.join('\n') 
            : (propertyData.houseRules || '')
          });
        
        setImages(propertyData.images || []);
        
      } catch (err) {
        let errorMessage = 'Failed to load property';
        
        if (err.response?.status === 404) {
          errorMessage = 'Property not found. It may have been deleted.';
        } else if (err.response?.status === 401) {
          errorMessage = 'Please login to edit properties';
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response?.status === 403) {
          errorMessage = 'You are not authorized to edit this property';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        toast.error(errorMessage);
        
        setTimeout(() => {
          navigate('/my-accommodations');
        }, 3000);
      } finally {
        setUploading(false);
      }
    };

    if (id) {
      fetchProperty();
    } else {
      toast.error('No property ID provided');
      navigate('/my-accommodations');
    }
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      if (subChild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subChild]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else if (type === 'checkbox') {
      const amenity = value;
      setFormData(prev => ({
        ...prev,
        amenities: checked 
          ? [...prev.amenities, amenity]
          : prev.amenities.filter(a => a !== amenity)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) || 0 : value
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    
    setUploading(true);
    
    for (const file of files) {
      try {
        const uploadResponse = await uploadAPI.uploadImage(file);
        const imageData = uploadResponse.data.data;
        setImages(prev => [...prev, imageData]);
        toast.success(`Successfully uploaded ${file.name}`);
      } catch (error) {
        const errorMessage = error.response?.data?.message || `Failed to upload ${file.name}`;
        toast.error(errorMessage);
      }
    }
    
    setUploading(false);
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.title || !formData.description) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (!formData.location.address.city || !formData.location.address.state || !formData.location.address.pincode) {
        toast.error('Please fill in all address fields');
        return;
      }
      if (images.length < 1) {
        toast.error('Please upload at least 1 image');
        return;
      }
    }
    if (step === 2) {
      if (!formData.price) {
        toast.error('Please set a price per night');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!user) {
    toast.error('Please login to edit a property');
    navigate('/login');
    return;
  }

  if (!property) {
    toast.error('Property data not loaded');
    return;
  }

  if (images.length < 1) {
    toast.error('Please upload at least 1 image');
    setStep(1);
    return;
  }

  try {
    const propertyData = {
  title: formData.title,
  description: formData.description,
  location: formData.location,
  type: formData.type,
  bedrooms: formData.bedrooms,
  bathrooms: formData.bathrooms,
  maxGuests: formData.maxGuests,
  amenities: formData.amenities,
  price: parseInt(formData.price),
  checkInTime: formData.checkInTime,
  checkOutTime: formData.checkOutTime,
  houseRules: typeof formData.houseRules === 'string' 
    ? formData.houseRules.split('\n').filter(rule => rule.trim())
    : (Array.isArray(formData.houseRules) ? formData.houseRules : []),
  images: images
};
    
    const result = await updateProperty(id, propertyData);
    
    if (result.success) {
      toast.success('Property updated successfully!');
      await fetchHostProperties();
      navigate('/my-accommodations');
    } else {
      toast.error(result.error || 'Failed to update property');
    }
    
  } catch {
    toast.error('Failed to update property. Please try again.');
  }
};

  const steps = [
    { number: 1, title: 'Basic Information' },
    { number: 2, title: 'Details & Amenities' },
    { number: 3, title: 'Rules & Pricing' }
  ];

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Your Property</h1>
            <p className="text-gray-600">Update your property details</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= stepItem.number 
                    ? 'bg-primary border-primary text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {step > stepItem.number ? (
                    <FaCheck className="w-5 h-5" />
                  ) : (
                    stepItem.number
                  )}
                </div>
                <span className={`ml-3 font-medium ${
                  step >= stepItem.number ? 'text-primary' : 'text-gray-500'
                }`}>
                  {stepItem.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-6 ${
                    step > stepItem.number ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Name *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter property title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    {propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="location.address.street"
                      value={formData.location.address.street}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Street address"
                    />
                    <input
                      type="text"
                      name="location.address.city"
                      value={formData.location.address.city}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="City *"
                      required
                    />
                    <input
                      type="text"
                      name="location.address.state"
                      value={formData.location.address.state}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="State *"
                      required
                    />
                    <input
                      type="text"
                      name="location.address.pincode"
                      value={formData.location.address.pincode}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Pincode *"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FaUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      {uploading ? 'Uploading images...' : 'Click to browse and upload images'}
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`btn-primary inline-block cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {uploading ? 'Uploading...' : 'Upload Photos'}
                    </label>
                  </div>
                  
                  {images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-3">
                        {images.length} images uploaded
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.url || image}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className="input-field resize-none"
                    placeholder="Describe your property..."
                    required
                  />
                </div>
              </Motion.div>
            )}

            {step === 2 && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900">Details & Amenities</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms *
                    </label>
                    <select
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'bedroom' : 'bedrooms'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms *
                    </label>
                    <select
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'bathroom' : 'bathrooms'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Guests *
                    </label>
                    <select
                      name="maxGuests"
                      value={formData.maxGuests}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'guest' : 'guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Per Night (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter price per night"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenitiesList.map(amenity => (
                      <label key={amenity} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          value={amenity}
                          checked={formData.amenities.includes(amenity)}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="font-medium capitalize">
                          {amenity.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </Motion.div>
            )}

            {step === 3 && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900">Rules & Final Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in Time *
                    </label>
                    <input
                      type="time"
                      name="checkInTime"
                      value={formData.checkInTime}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-out Time *
                    </label>
                    <input
                      type="time"
                      name="checkOutTime"
                      value={formData.checkOutTime}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    House Rules
                  </label>
                  <textarea
                      name="houseRules"
                      value={formData.houseRules}
                      onChange={handleInputChange}
                      rows={4}
                      className="input-field resize-none"
                      placeholder="Enter each rule on a new line. Example:
                    No smoking
                    No pets allowed
                    Check-in after 2 PM
                    Quiet hours after 10 PM"
                    />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Listing Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Property:</span>
                      <span className="font-semibold">{formData.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-semibold">{formData.location.address.city}, {formData.location.address.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-semibold capitalize">{formData.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-semibold">₹{formData.price}/night</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Guests:</span>
                      <span className="font-semibold">{formData.maxGuests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Images:</span>
                      <span className="font-semibold">{images.length} uploaded</span>
                    </div>
                  </div>
                </div>
              </Motion.div>
            )}

            <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary"
                >
                  Previous
                </button>
              ) : (
                <div></div>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary"
                  disabled={uploading}
                >
                  Next
                </button>
              ) : (
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || uploading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                      Updating Property...
                    </div>
                  ) : (
                    'Update Property'
                  )}
                </Motion.button>
              )}
            </div>
          </form>
        </Motion.div>
      </div>
    </div>
  );
};

export default EditAccommodation;