const mongoose = require('mongoose');

const isPositive = (value) => value >= 0;
const positiveNumberValidator = {
  validator: isPositive,
  message: '{VALUE} must be a positive number.',
};

const addOnsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'must have name of AddOns'],
  },
  value: {
    type: Number,
    required: [true, 'must have value of AddOns'],
    validate: positiveNumberValidator,
  },
});

const AddOns = mongoose.model('AddOns', addOnsSchema);

module.exports = AddOns;
