import express from 'express';
import {
  createBooking,
  getBookings,
  getBooking,
  getHostBookings
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getBookings)
  .post(protect, createBooking);

router.get('/host/my-bookings', protect, getHostBookings);

router.route('/:id')
  .get(protect, getBooking);

export default router;