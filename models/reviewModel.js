const mongoose = require('mongoose');
const car = require('./carModel');
const catchAsync = require('../utils/catchAsync');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "can't be empty"],
    },
    rating: {
      type: Number,
      max: [5, 'below or eqaul 5'],
      min: [1, 'above 0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    carId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Car',
      required: [true, 'Must belong to Car'],
    },

    customerId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Customer',
      required: [true, 'Must belong to Customer'],
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

reviewSchema.index({ carId: 1, customerId: 1 }, { unique: true });

// reviewSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'customerId',
//     select: 'name',
//   });
//   next();
// });

reviewSchema.statics.calcAvrgRating = async function (carId) {
  const stats = await this.aggregate([
    {
      $match: { car: carId },
    },
    {
      $group: {
        _id: '$car',
        nRating: { $sum: 1 },
        avrgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await car.findByIdAndUpdate(carId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avrgRating,
    });
  } else {
    await car.findByIdAndUpdate(carId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAvrgRating(this.car);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAvrgRating(this.r.car);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
