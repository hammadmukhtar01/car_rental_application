const ExtraFeatures = require('../../models/extraFeaturesModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../factoryHandler');

exports.createExtraFeatures = catchAsync(async (req, res, next) => {
  try {

    const extraFeatures = await ExtraFeatures.create(req.body);

    res.status(201).json({
      status: 'success',
      extraFeaturesData: extraFeatures,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while creating extra Feature', error)
    );
  }
});

exports.getAllExtraFeatures = catchAsync(async (req, res, next) => {
  try {
    const extraFeaturess = await ExtraFeatures.find();
    res.status(200).json({
      status: 'Success',
      extraFeaturesData: extraFeaturess || `No Extra Features Found`,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while fetching Extra Featuress Data', error)
    );
  }
});

exports.updateExtraFeatures = catchAsync(async (req, res, next) => {
  try {
    const updateExtraFeatures = await ExtraFeatures.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updateExtraFeatures) {
      return next(
        new AppError('Extra Features with the given id not found!', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      extraFeaturesData: updateExtraFeatures,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while updating the Extra Features', error)
    );
  }
});

exports.getSingleExtraFeatures = factory.getOne(ExtraFeatures);
exports.deleteSingleExtraFeatures = factory.deleteOne(ExtraFeatures);
