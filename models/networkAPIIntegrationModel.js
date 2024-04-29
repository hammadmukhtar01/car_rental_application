const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const isPositive = (value) => value >= 0;
const positiveNumberValidator = {
  validator: isPositive,
  message: '{VALUE} must be a positive number.',
};
const networkAPIIntegrationSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'must have name of firstName'],
    },
    lastName: {
      type: String,
      required: [true, 'must have name of lastName'],
    },
    email: {
      type: String,
      required: [true, 'Must have a email'],
      unique: [true, 'Email must not be used before'],
      lowercase: true,
      validate: positiveNumberValidator,
    },
    transactionType: {
      type: String,
      default: 'PURCHASE',
      required: [true, 'must have transactionType'],
    },
    emailSubject: {
      type: String,
      default: 'Click to Pay: Milele Car Rental Invoice',
      required: [true, 'must have emailSubject'],
    },
    invoiceExpiryDate: {
      type: Date,
      required: [true, 'must have emailSubject'],
    },

    paymentAttempts: {
      type: Number,
      default: 3,
      validate: positiveNumberValidator,
      required: [true, 'Must have total Number of paymentAttempts'],
    },

    redirectUrl: {
      type: String,
      default: 'https://milelecarrental.com/booking-success',
      required: [true, 'Must have redirectUrl'],
    },

    items: [
      {
        description: {
          type: String,
          default: 'Milele Car Rental booking',
          required: [true, 'Description is required for booked item'],
        },
        totalPrice: {
          currencyCode: {
            type: String,
            default: 'AED',
            required: [true, 'Must have currencyCode'],
          },
          value: {
            type: Number,
            validate: positiveNumberValidator,
            required: [true, 'Must have value'],
          },
        },
        quantity: {
          type: Number,
          default: 1,
          required: [true, 'Quantity is required for each item'],
          validate: positiveNumberValidator,
        },
      },
    ],

    total: {
      currencyCode: {
        type: String,
        default: 'AED',
        required: [true, 'Must have currencyCode'],
      },
      value: {
        type: Number,
        validate: positiveNumberValidator,
        required: [true, 'Must have value'],
      },
    },

    message: {
      type: String,
      required: [true, 'must have message'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const NetworkAPIIntegration = mongoose.model(
  'NetworkAPIIntegration',
  networkAPIIntegrationSchema
);

module.exports = NetworkAPIIntegration;
