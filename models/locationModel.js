const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  pickupLocations: [{
    type: [String],
    required: [true, 'must have pickup Locations'],
  }],

  dropOffLocations: [{
    type: [String],
    required: [true, 'must have dropoff locations'],
  }],

});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
