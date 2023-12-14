const mongoose = require('mongoose');

const carSchema = mongoose.Schema(
  {
    carName: {
      type: String,
      required: [true, 'Must have name of car'],
      // unique: [true, 'Name must not be used before'],
    },
    mainCarImage: {
      type: String,
      required: [true, 'must have main car images'],
    },
    // carImages: {
    //   type: [String],
    //   required: [true, 'must have car images'],
    // },
    category: { type: String, required: [true, 'must have category'] },
    quantity: { type: Number, required: [true, 'must have quantity'] },
    detailsFeatures: {
      type: [String],
      required: [true, 'must have features'],
    },
    technicalData: [
      {
        name: {
          type: String,
          required: [true, 'must have technical data name'],
        },
        value: {
          type: String,
          required: [true, 'must have technical data value'],
        },
      },
    ],
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'must have rating above or equal 1'],
      max: [5, 'must have rating below or equal 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    soldItem: {
      type: Number,
      default: 0,
    },
    salePrice: {
      type: Number,
      required: [true, 'must have number of sale price'],
    },
    originalPrice: {
      type: Number,
      required: [true, 'must have original price'],
    },
    description: {
      type: String,
      required: [true, 'must have description'],
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

// carSchema.virtual('reviews', {
//   ref: 'Review',
//   foreignField: 'car',
//   localField: '_id',
// });

// carSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'reviews',
//   });
//   next();
// });

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
