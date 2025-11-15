import React, { useState, useCallback } from 'react';
import { propertiesAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { PropertyContext } from './propertyContex';

export const PropertyProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [hostProperties, setHostProperties] = useState([]);

  const fetchHostProperties = useCallback(async () => {
    setLoading(true);
    try {
      const response = await propertiesAPI.getHostProperties();
      
      let properties = [];
      
      if (response.data && response.data.success) {
        if (Array.isArray(response.data.data)) {
          properties = response.data.data;
        } else {
          properties = [];
        }
      } else {
        properties = [];
      }
      
      setHostProperties(properties);
      return { success: true, data: properties };
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch properties';
      toast.error(message);
      setHostProperties([]);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const createProperty = useCallback(async (propertyData) => {
    setLoading(true);
    try {
      const response = await propertiesAPI.createProperty(propertyData);
      toast.success('Property listed successfully!');
      await fetchHostProperties();
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create property';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [fetchHostProperties]);

const updateProperty = useCallback(async (id, propertyData) => {
  setLoading(true);
  try {
    
    const response = await propertiesAPI.updateProperty(id, propertyData);
    
    toast.success('Property updated successfully!');
    await fetchHostProperties();
    return { success: true, data: response.data };
    
  } catch (error) {
    
    const message = error.response?.data?.message || 'Failed to update property';
    toast.error(message);
    
    return { success: false, error: message };
  } finally {
    setLoading(false);
  }
}, [fetchHostProperties]);

  const deleteProperty = useCallback(async (id) => {
    setLoading(true);
    try {
      await propertiesAPI.deleteProperty(id);
      setHostProperties(prev => prev.filter(property => property._id !== id));
      toast.success('Property deleted successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete property';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = React.useMemo(() => ({
    loading,
    hostProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    fetchHostProperties
  }), [
    loading,
    hostProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    fetchHostProperties
  ]);

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};