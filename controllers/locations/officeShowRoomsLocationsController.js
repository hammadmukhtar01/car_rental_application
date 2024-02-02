const Coupon = require('../../models/couponModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../factoryHandler');

exports.createCoupon = catchAsync(async (req, res, next) => {
  try {

    const coupon = await Coupon.create(req.body);

    res.status(201).json({
      status: 'success',
      couponData: coupon,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while creating a copen', error)
    );
  }
});

exports.getAllCoupon = catchAsync(async (req, res, next) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json({
      status: 'Success',
      couponData: coupons || `No Coupon Found`,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while fetching Coupons Data', error)
    );
  }
});

exports.updateCoupon = catchAsync(async (req, res, next) => {
  try {
    const updateCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updateCoupon) {
      return next(
        new AppError('Coupon with the given id not found!', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      couponData: updateCoupon,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while updating the Coupon', error)
    );
  }
});

exports.getSingleCoupon = factory.getOne(Coupon);
exports.deleteSingleCoupon = factory.deleteOne(Coupon);
