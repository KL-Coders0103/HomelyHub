import express from 'express';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getHostProperties
} from '../controllers/propertyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const validatePropertyId = (req, res, next) => {
  const { id } = req.params;
  
  console.log('🟢 validatePropertyId middleware called for:', req.method, req.path);
  console.log('Property ID:', id);
  
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid property ID format'
    });
  }
  
  next();
};

// Use EXPLICIT route definitions (fixes the issue)
router.get('/', getProperties);
router.post('/', protect, createProperty);
router.get('/user/my-properties', protect, getHostProperties);

// Explicit parameterized routes - THIS FIXES THE PUT ISSUE
router.get('/:id', validatePropertyId, getProperty);
router.put('/:id', protect, validatePropertyId, updateProperty);
router.delete('/:id', protect, validatePropertyId, deleteProperty);

export default router;