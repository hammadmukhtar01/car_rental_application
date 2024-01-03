const mongoose = require('mongoose');
const SimpleFeature = require('./simpleFeaturesModel');
const ComplexFeature  = require('./complexFeaturesModel');
const ExtraFeatures  = require('./extraFeaturesModel');
const AddOns = require('./addOnsModel');
const Coupon = require('./couponModel');

const isPositive = (value) => value >= 0;
const positiveNumberValidator = {
  validator: isPositive,
  message: '{VALUE} must be a positive number.',
};
const carSchema = mongoose.Schema(
  {
    carName: {
      type: String,
      required: [true, 'Must have name of car'],
    },

    carImages: {
      type: [String],
      required: [true, 'must have car images'],
    },
    carModel: { type: String, required: [true, 'must have car Model'] },
    carYear: { type: Number, required: [true, 'must have car year'] },

    carAvailabilityDateStart: {
      type: Date,
      required: [true, 'must have car availablity start date'],
    },

    carAvailabilityDateEnd: {
      type: Date,
      required: [true, 'must have car availablity end date'], 
    },

    quantity: {
      type: Number,
      required: [true, 'must have quantity'],
      min: [1, "quantity greater than or equal to 1"],
      validate: positiveNumberValidator,
    },

    offerValue: {
      type: Number,
      default: 0,
    },

    simpleFeatures: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'SimpleFeature',
        required: true,
      },
    ],
    complexFeatures: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'ComplexFeature',
        required: true,
      },
    ],

    detailsFeatures: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'ExtraFeatures',
        required: true,
      },
    ],

    addOnsData: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'AddOns',
        required: true,
      },
    ],

    couponId: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Coupon',
        default: null,      
      },
    ],

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'must have rating above or equal 1'],
      max: [5, 'must have rating below or equal 5'],
      set: (val) => Math.round(val * 10) / 10,
      validate: positiveNumberValidator,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    carAvailabilityStatus: {
      type: String,
      enum: ['Available', 'Booked'],
      default: 'Available',
    },
    bookedItem: {
      type: Number,
      default: 0,
    },
    salePrice: {
      type: Number,
      required: [true, 'must have number of sale price'],
      validate: positiveNumberValidator,
    },
    originalPrice: {
      type: Number,
      required: [true, 'must have original price'],
      validate: positiveNumberValidator,
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

carSchema.pre('save', async function (next) {
  const validateIds = async (idArray, Model) => {
    try {
      const documents = await Model.find({ _id: { $in: idArray } });
      if (documents.length !== idArray.length) {
        throw new Error(`Invalid reference in ${Model.modelName}`);
      }
    } catch (error) {
      throw new Error(`Error validating references in ${Model.modelName}: ${error.message}`);
    }
  };

  try {
    await validateIds(this.simpleFeatures, SimpleFeature);
    await validateIds(this.complexFeatures, ComplexFeature);
    await validateIds(this.detailsFeatures, ExtraFeatures);
    await validateIds(this.addOnsData, AddOns);
    await validateIds(this.couponId, Coupon);

    next();
  } catch (error) {
    next(error);
  }
});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
