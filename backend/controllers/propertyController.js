import asyncHandler from '../middleware/asyncHandler.js';
import Property from '../models/Property.js';

export const getProperties = asyncHandler(async (req, res) => {
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  let query = Property.find(JSON.parse(queryStr)).populate('host', 'name avatar');

  if (req.query.search) {
    query = query.find({
      $or: [
        { title: { $regex: req.query.search, $options: 'i' } },
        { 'location.city': { $regex: req.query.search, $options: 'i' } },
        { 'location.state': { $regex: req.query.search, $options: 'i' } }
      ]
    });
  }

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const startIndex = (page - 1) * limit;
  const total = await Property.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  const properties = await query;

  const pagination = {};

  if (startIndex + limit < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: properties.length,
    pagination,
    data: properties
  });
});

export const getProperty = asyncHandler(async (req, res) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid property ID'
    });
  }

  const property = await Property.findById(req.params.id).populate('host', 'name avatar responseRate responseTime');

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  res.status(200).json({
    success: true,
    data: property
  });
});

export const createProperty = asyncHandler(async (req, res) => {
  req.body.host = req.user.id;

  const property = await Property.create(req.body);

  res.status(201).json({
    success: true,
    data: property
  });
});

export const updateProperty = asyncHandler(async (req, res) => {
  console.log('🟢 updateProperty controller called');
  console.log('Property ID:', req.params.id);
  console.log('Request Body:', req.body);
  console.log('User ID:', req.user.id);

  let property = await Property.findById(req.params.id);

  if (!property) {
    console.log('❌ Property not found');
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  console.log('Property host:', property.host.toString());
  console.log('Request user:', req.user.id);

  if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
    console.log('❌ Not authorized to update this property');
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this property'
    });
  }

  property = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  console.log('✅ Property updated successfully');
  res.status(200).json({
    success: true,
    data: property
  });
});

export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this property'
    });
  }

  await property.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Property deleted successfully'
  });
});

export const getHostProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ host: req.user.id }).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties
  });
});