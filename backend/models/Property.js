import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a property title'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a property description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  host: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: {
      street: String,
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      country: {
        type: String,
        default: 'India'
      },
      pincode: {
        type: String,
        required: true
      }
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price per night'],
    min: [0, 'Price cannot be negative']
  },
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  amenities: [{
    type: String,
    enum: [
      'wifi', 'kitchen', 'parking', 'pool', 'ac', 'tv', 
      'washingMachine', 'breakfast', 'gym', 'hotTub', 
      'fireplace', 'balcony', 'garden', 'bbq'
    ]
  }],
  type: {
    type: String,
    enum: ['apartment', 'house', 'villa', 'cottage', 'farmhouse', 'studio'],
    required: true
  },
  bedrooms: {
    type: Number,
    required: true,
    min: [1, 'At least 1 bedroom is required']
  },
  bathrooms: {
    type: Number,
    required: true,
    min: [1, 'At least 1 bathroom is required']
  },
  maxGuests: {
    type: Number,
    required: true,
    min: [1, 'At least 1 guest is required']
  },
  checkInTime: {
    type: String,
    default: '14:00'
  },
  checkOutTime: {
    type: String,
    default: '12:00'
  },
  houseRules: [String],
  availability: {
    startDate: Date,
    endDate: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

propertySchema.index({ 
  'location.city': 'text', 
  'location.state': 'text', 
  title: 'text', 
  description: 'text' 
});

export default mongoose.model('Property', propertySchema);