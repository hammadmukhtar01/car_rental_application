const mongoose = require('mongoose');

const extraFeaturesSchema = new mongoose.Schema({
  featureName: {
    type: String,
    required: [true, 'must have name of extra feature'],
  },
});

const ExtraFeatures = mongoose.model('ExtraFeatures', extraFeaturesSchema);

module.exports = ExtraFeatures;
