const Location = require('../../models/pickupDropoffLocationsModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../factoryHandler');

exports.createLocation = catchAsync(async (req, res, next) => {
  try {

    const location = await Location.create(req.body);

    res.status(201).json({
      status: 'success',
      locationData: location,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while creating a copen', error)
    );
  }
});

exports.getAllLocation = catchAsync(async (req, res, next) => {
  try {
    const locations = await Location.find();
    res.status(200).json({
      status: 'Success',
      locationData: locations || `No Location Found`,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while fetching Location Data', error)
    );
  }
});

exports.updateLocation = catchAsync(async (req, res, next) => {
  try {
    const updateLocation = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updateLocation) {
      return next(
        new AppError('Location with the given id not found!', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      locationData: updateLocation,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while updating the Location', error)
    );
  }
});

exports.getSingleLocation = factory.getOne(Location);
exports.deleteSingleLocation = factory.deleteOne(Location);
