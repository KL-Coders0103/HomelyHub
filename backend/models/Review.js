import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.ObjectId,
    ref: 'Property',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: [1000, 'Review cannot be more than 1000 characters']
  },
  images: [{
    public_id: String,
    url: String
  }],
  hostResponse: {
    comment: String,
    respondedAt: Date
  },
  isRecommended: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

reviewSchema.index({ booking: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);