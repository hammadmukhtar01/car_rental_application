const mongoose = require('mongoose');

const simpleFeatureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'must have name of feature'],
  },
  icon: {
    filename: String,
    contentType: String,
    iconData: Buffer,
  },
});

const SimpleFeature = mongoose.model('SimpleFeature', simpleFeatureSchema);

module.exports = SimpleFeature;
