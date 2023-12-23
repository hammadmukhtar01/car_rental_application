const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bookingSchema = new mongoose.Schema(
  {
    additionalBookingDetailsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdditionalBooking',
      required: true,
    },

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

    cardholderName: {
      type: String,
      required: [true, "Must have Card Holder name"]
    },

    bookingno: {
      type: String,
      unique: true,
      default: function () {
        const timestamp = Date.now().toString(36);
        const random = uuidv4().split('-').join('').substring(0, 6);

        return `${timestamp}${random}`;
      },
    },

    bookingStatus: {
      type: String,
      enum: ['Pending', 'Approved'],
      default: 'Pending',
    },

    paymentStatus: {
      type: String,
      enum: ['Done', 'Pending'],
      default: 'Pending',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookingSchema.pre('save', async function (next) {
  try {
    const additionalBookingDetails = await mongoose
      .model('AdditionalBooking')
      .findById(this.additionalBookingDetailsId);

    if (additionalBookingDetails) {
      await mongoose
        .model('Car')
        .updateOne(
          { _id: additionalBookingDetails.carId },
          { carAvailabilityStatus: 'Booked' }
        );
    }

    next();
  } catch (error) {
    next(error);
  }
});

bookingSchema.pre('save', async function (next) {
  try {
    const additionalBookingDetails = await mongoose
      .model('AdditionalBooking')
      .findById(this.additionalBookingDetailsId);

    if (additionalBookingDetails) {
      await this.constructor.updateCarAvailabilityStatus(
        additionalBookingDetails.carId
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});

bookingSchema.statics.updateCarAvailabilityStatus = async function (carId) {
  try {
    await mongoose
      .model('Car')
      .updateOne(
        { _id: carId },
        { $inc: { bookedItem: 1 },  $inc: { quantity: -1 }, carAvailabilityStatus: 'Booked' }
      );
  } catch (error) {
    throw new Error(`Error updating car availability status: ${error.message}`);
  }
};

bookingSchema.methods.calculateTotalPaidAmount = async function () {
  const additionalBookingDetails = await mongoose
    .model('AdditionalBooking')
    .findById(this.additionalBookingDetailsId);

  return additionalBookingDetails ? additionalBookingDetails.totalPrice : 0;
};


const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
