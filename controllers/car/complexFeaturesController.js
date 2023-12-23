const ComplexFeature = require('../../models/complexFeaturesModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../factoryHandler');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('icon');

exports.createComplexFeature = catchAsync(async (req, res, next) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        return next(new AppError('Error uploading icon', 400));
      }

      if (!req.file) {
        return next(new AppError('No file uploaded', 400));
      }

      const { name, value } = req.body;

      const complexFeature = await ComplexFeature.create({
        name,
        value,
        icon: {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
          iconData: req.file.buffer,
        },
      });

      res.status(201).json({
        status: 'success',
        data: complexFeature,
      });
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while creating a new complex feature', error)
    );
  }
});

exports.getAllComplexFeatures = catchAsync(async (req, res, next) => {
  try {
    const complexFeatures = await ComplexFeature.find();
    res.status(200).json({
      status: 'Success',
      complexFeaturesData: complexFeatures || `No Complex Feature Found`,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while fetching complex feature details', error)
    );
  }
});

exports.updateComplexFeature = catchAsync(async (req, res, next) => {
  try {
    const updatedFeature = await ComplexFeature.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedFeature) {
      return next(
        new AppError('Complex feature with the given id not found!', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: updatedFeature,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while updating the complex feature', error)
    );
  }
});

exports.getSingleComplexFeature = factory.getOne(ComplexFeature);
exports.deleteSingleComplexFeature = factory.deleteOne(ComplexFeature);
