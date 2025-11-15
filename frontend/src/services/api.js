import axios from 'axios';

const getBackendURL = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5001/api';
  }

  
  return 'https://homelyhub-backend-85nl.onrender.com/api';
};

const API_URL = getBackendURL();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateDetails: (userData) => api.put('/auth/updatedetails', userData),
};

export const propertiesAPI = {
  getProperties: (params = {}) => api.get('/properties', { params }),
  getProperty: (id) => api.get(`/properties/${id}`),
  createProperty: (propertyData) => api.post('/properties', propertyData),
  updateProperty: (id, propertyData) => {
    return api.put(`/properties/${id}`, propertyData);
  },
  deleteProperty: (id) => api.delete(`/properties/${id}`),
  getHostProperties: () => api.get('/properties/user/my-properties'),
};

export const bookingsAPI = {
  getBookings: () => api.get('/bookings'),
  getBooking: (id) => api.get(`/bookings/${id}`),
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getHostBookings: () => api.get('/bookings/host/my-bookings'),
};

export const uploadAPI = {
  uploadImage: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return api.post('/upload/image', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000,
    });
  },
  deleteImage: (public_id) => api.delete('/upload/image', { data: { public_id } })
};

export default api;
