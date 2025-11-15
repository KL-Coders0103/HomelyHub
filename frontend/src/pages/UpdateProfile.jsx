import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { FaUser, FaArrowLeft, FaUpload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/useAuth';
import { authAPI, uploadAPI } from '../services/api';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: null
      });
      
      if (user.avatar?.url) {
        setAvatarPreview(user.avatar.url);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar' && files[0]) {
      const file = files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      setFormData(prev => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    let avatarData = null;
    if (formData.avatar) {
      try {
        const uploadResponse = await uploadAPI.uploadImage(formData.avatar);
        avatarData = uploadResponse.data.data;
      } catch {
        toast.error('Failed to upload image. Please try again.');
        setIsLoading(false);
        return;
      }
    }

    const updateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      ...(avatarData && { avatar: avatarData })
    };

    const response = await authAPI.updateDetails(updateData);
    
    if (response.data.success) {
      await updateUser(response.data.user); 
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } else {
      throw new Error(response.data.message || 'Update failed');
    }
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile. Please try again.';
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  const isFormValid = () => {
    return formData.name.trim() && formData.email.trim() && formData.phone.trim();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mr-4"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Update Profile</h1>
        </div>

        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-linear-to-r from-primary to-accent flex items-center justify-center text-white text-2xl font-bold mb-4 overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : user?.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="w-8 h-8" />
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <FaUpload className="w-4 h-4 text-gray-600" />
                  <input
                    id="avatar-upload"
                    name="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500">
                (Image size should be less than 2MB)
              </p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your phone number"
                pattern="[0-9]{10}"
                maxLength="10"
              />
              <p className="text-xs text-gray-500 mt-1">
                10-digit phone number required
              </p>
            </div>

            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="w-full btn-primary py-3 text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                  Updating Profile...
                </div>
              ) : (
                'Update Profile'
              )}
            </Motion.button>
          </form>
        </Motion.div>
      </div>
    </div>
  );
};

export default UpdateProfile;