const mongoose = require('mongoose');
const validator = require('validator');

const isPositive = (value) => value >= 0;
const positiveNumberValidator = {
  validator: isPositive,
  message: '{VALUE} must be a positive number.',
};

const leaseNowUserData = mongoose.Schema(
  {
    fname: {
      type: String,
      minlength: [3, 'must have greater or equal to 3 length'],
      maxlength: [50, 'must have less or equal to 50 length'],
      required: [true, 'First Name is missing'],
    },
    lname: {
      type: String,
      minlength: [3, 'must have greater or equal to 3 length'],
      maxlength: [50, 'must have less or equal to 50 length'],
      required: [true, 'Last Name is missing'],
    },
    email: {
      type: String,
      required: [true, 'Must have a email'],
      validate: [validator.isEmail, 'Email is In-Valid'],
      lowercase: true,
    },

    phoneNumber: {
      type: String,
      // match: /^(\()?\d{3}(\))?(-|\s)?\d{7}$/,
      minlength: [9, 'Phone Number is In-Valid'],
      maxlength: [15, 'Phone Number is In-Valid'],
      required: [true, 'Phone Number is missing.'],
    },

    comment: {
      type: String,
      required: [true, 'Must have a comment'],
      maxlength: [500, 'Comment must have less or equal to 500 characters'],
    },

    estimateCarPrice: {
      type: Number,
      required: [true, 'Must have est. car price'],
      min: [30000, 'Estimated car price must be at least 30,000'],

      validate: positiveNumberValidator,
    },

    monthDuration: {
      type: Number,
      required: [true, 'Must have number of months'],
      min: [12, 'Duration must be at least 12 months'],
      max: [60, 'Duration must not exceed 60 months'],
      validate: positiveNumberValidator,
    },

    downPaymentPercentage: {
      type: Number,
      required: [true, 'Must have downpayment percentage'],
      min: [0, 'Down payment percentage cannot be negative'],
      max: [80, 'Down payment percentage cannot exceed 80'],
      validate: positiveNumberValidator,
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

const LeaseNowUserData = mongoose.model('LeaseNowUserData', leaseNowUserData);

module.exports = LeaseNowUserData;
