import asyncHandler from '../middleware/asyncHandler.js';
import Booking from '../models/Booking.js';
import Property from '../models/Property.js';

export const createBooking = asyncHandler(async (req, res) => {
  const {
    propertyId,
    checkInDate,
    checkOutDate,
    guests,
    specialRequests
  } = req.body;

  const property = await Property.findById(propertyId);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  const totalAmount = property.price * nights;

  const booking = await Booking.create({
    property: propertyId,
    user: req.user.id,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    guests,
    totalAmount,
    specialRequests
  });

  await booking.populate('property', 'title images location price');
  await booking.populate('user', 'name email');

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: booking
  });
});

export const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate('property', 'title images location')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('property')
    .populate('user', 'name email phone');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this booking'
    });
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

export const getHostBookings = asyncHandler(async (req, res) => {
  const properties = await Property.find({ host: req.user.id });
  const propertyIds = properties.map(property => property._id);

  const bookings = await Booking.find({ property: { $in: propertyIds } })
    .populate('property', 'title images')
    .populate('user', 'name email phone')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});