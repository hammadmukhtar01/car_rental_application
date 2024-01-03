const AddOns = require('../../models/addOnsModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../factoryHandler');

exports.createAddOns = catchAsync(async (req, res, next) => {
  try {

    const addOns = await AddOns.create(req.body);

    res.status(201).json({
      status: 'success',
      addOnsData: addOns,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while creating a copen', error)
    );
  }
});

exports.getAllAddOns = catchAsync(async (req, res, next) => {
  try {
    const addOnss = await AddOns.find();
    res.status(200).json({
      status: 'Success',
      addOnsData: addOnss || `No AddOns Found`,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while fetching AddOns Data', error)
    );
  }
});

exports.updateAddOns = catchAsync(async (req, res, next) => {
  try {
    const updateAddOns = await AddOns.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updateAddOns) {
      return next(
        new AppError('AddOns with the given id not found!', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      addOnsData: updateAddOns,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while updating the AddOns', error)
    );
  }
});

exports.getSingleAddOns = factory.getOne(AddOns);
exports.deleteSingleAddOns = factory.deleteOne(AddOns);
