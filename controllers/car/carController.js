const Car = require('../../models/carModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../factoryHandler');

exports.createCar = catchAsync(async (req, res, next) => {
  console.log('1 in create car');

  try {

    const carCreatingData = req.body;

    console.log('Request Body:', carCreatingData);
    console.log('Uploaded Files:', req.files);

    if (req.body.salePrice >= req.body.originalPrice) {
      return next(new AppError('Sale price must be less than the original price', 400));
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'Error',
        message: 'Car images are required for storage'
      });
    }

    const carImagesArray = req.files.map((file) => `http://localhost:8000/utils/uploads/${file.filename}`);

    const carData = {
      ...req.body,
      carImages: carImagesArray,
    };

    const createCarData = await Car.create(carData);

    res.status(201).json({
      status: 'success',
      data: createCarData,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError('Error while creating a new car', error));
  }
});


exports.updateCar = catchAsync(async (req, res, next) => {
  try {
    if (req.body.salePrice >= req.body.originalPrice) {
      return next(
        new AppError('Sale price must be less than the original price', 400)
      );
    }

    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCar) {
      return next(new AppError('Car with the given id not found!', 404));
    }

    res.status(200).json({
      status: 'success',
      data: updatedCar,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError('Error while updating the car', error));
  }
});

exports.getAllCars = catchAsync(async (req, res, next) => {
  try {
    const cars = await Car.find();
    res.status(200).json({
      status: 'Success',
      carsData: cars || `No Car Found`,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError('Error while fetching car details', error));
  }
});

exports.getSingleCar = factory.getOne(Car);
exports.deleteSingleCar = factory.deleteOne(Car);
