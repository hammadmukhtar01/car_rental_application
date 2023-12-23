const SimpleFeature = require('../../models/simpleFeaturesModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../factoryHandler');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('icon');

exports.createSimpleFeature = catchAsync(async (req, res, next) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        return next(new AppError('Error uploading icon', 400));
      }

      if (!req.file) {
        return next(new AppError('No file uploaded', 400));
      }

      const { name } = req.body;

      const simpleFeature = await SimpleFeature.create({
        name,
        icon: {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
          iconData: req.file.buffer,
        },
      });

      res.status(201).json({
        status: 'success',
        simpleFeaturesData: simpleFeature,
      });
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while creating a new complex feature', error)
    );
  }
});

exports.getAllSimpleFeatures = catchAsync(async (req, res, next) => {
  try {
    const simpleFeatures = await SimpleFeature.find();
    res.status(200).json({
      status: 'Success',
      simpleFeaturesData: simpleFeatures || `No Simple Feature Found`,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while fetching simple feature details', error)
    );
  }
});

exports.updateSimpleFeature = catchAsync(async (req, res, next) => {
  try {
    const updatedFeature = await SimpleFeature.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedFeature) {
      return next(
        new AppError('Simple feature with the given id not found!', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      simpleFeaturesData: updatedFeature,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError('Error while updating the simple feature', error));
  }
});

exports.getSingleSimpleFeature = factory.getOne(SimpleFeature);
exports.deleteSingleSimpleFeature = factory.deleteOne(SimpleFeature);
