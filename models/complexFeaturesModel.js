const mongoose = require('mongoose');

const complexFeatureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'must have name of feature'],
  },
  icon: {
    filename: String,
    contentType: String,
    iconData: Buffer,
  },
  value: {
    type: Number,
    required: [true, 'must have value of feature'],
  },

});

const ComplexFeature = mongoose.model('ComplexFeature', complexFeatureSchema);

module.exports = ComplexFeature;
