const Car = require('../../models/carModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../factoryHandler');

exports.createCar = catchAsync(async (req, res, next) => {
  console.log('1 in create car');
  try {
    if (req.body.salePrice >= req.body.originalPrice) {
      return next(
        new AppError('Sale price must be less than the original price', 400)
      );
    }

    const car = await Car.create(req.body);

    res.status(201).json({
      status: 'success',
      data: car,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError('Error while creating new car', error));
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
