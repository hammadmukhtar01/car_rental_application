const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  cityName: {
    type: String,
    required: [true, 'must have name of city for pickup and drop off availability'],
  },
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
