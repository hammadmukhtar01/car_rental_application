const mongoose = require('mongoose');

const isPositive = (value) => value >= 0;
const positiveNumberValidator = {
  validator: isPositive,
  message: '{VALUE} must be a positive number.',
};

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'must have name of coupon'],
  },
  value: {
    type: Number,
    required: [true, 'must have value of coupon'],
    validate: positiveNumberValidator,
  },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
