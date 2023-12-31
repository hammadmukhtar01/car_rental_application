const mongoose = require('mongoose');

const isPositive = (value) => value >= 0;
const positiveNumberValidator = {
  validator: isPositive,
  message: '{VALUE} must be a positive number.',
};
const additionalDetailsSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },

    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },

    noOfBookingDays: {
      type: Number,
      default: 1,
      required: [true, 'Must have total Number of Bookings'],
    },

    totalPrice: {
      type: Number,
      required: true,
      validate: positiveNumberValidator,
    },

    pickupCarDetails: {
      pickupDateTime: {
        type: Date,
        required: [true, 'must have car pickup date time'],
      },
      pickupLocation: {
        type: String,
        required: [true, 'must have car pickup location name'],
      },
    },

    returnCarDetails: {
      returnDateTime: {
        type: Date,
        required: [true, 'must have car return date time'],
      },
      returnLocation: {
        type: String,
        required: [true, 'must have car return location name'],
      },
    },

    // User Data

    arrivalTime: {
      type: Date,
      required: [true, 'must have flight arrival time'],
    },
    returnTime: {
      type: Date,
      required: [true, 'must have flight return time'],
    },
    flightNumber: {
      type: String,
      required: [true, 'must have flight number'],
    },
    driverName: {
      type: String,
      required: [true, 'must have driver name'],
    },
    drivingLisence: {
      type: String,
      required: [true, 'must have driving Lisence value'],
    },
    comments: {
      type: String,
      required: [true, 'must have comments'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const AdditionalBooking = mongoose.model(
  'AdditionalBooking',
  additionalDetailsSchema
);

module.exports = AdditionalBooking;
