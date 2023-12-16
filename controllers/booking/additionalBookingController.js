const AdditionalBooking = require('../../models/additionalBookingDetailsModel');
const Customer = require('../../models/customerModel');
const Car = require('../../models/carModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const Factory = require('../factoryHandler');

// Create a new booking
exports.createAdditionalBooking = catchAsync(async (req, res, next) => {
  try {
    const {
      customerId,
      carId,
      additionalCharges,
      discountPrice,
      totalPrice,
      pickupCarDetails,
      returnCarDetails,
      arrivalTime,
      returnTime,
      flightNumber,
      driverName,
      drivingLisence,
      comments,
    } = req.body;

    const customer = await Customer.findById(customerId);
    console.log('Customer issssss: --- ', customer);

    if (!customer) {
      return next(new AppError('Customer not found...'));
    }

    const car = await Car.findById(carId);
    console.log('Car issssss: --- ', car);

    if (!car) {
      return next(new AppError('Car not found...'));
    }

    const additionalBooking = new AdditionalBooking({
      customerId,
      carId,
      additionalCharges,
      discountPrice,
      totalPrice,
      pickupCarDetails,
      returnCarDetails,
      arrivalTime,
      returnTime,
      flightNumber,
      driverName,
      drivingLisence,
      comments,
    });

    const additionalBookings = await additionalBooking.save();

    res.status(201).json({
      status: 'success',
      message: 'Additional Booking Created Successfully',
      additionalBookingDetails: {
        additionalBookings,
      },
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while creating additional booking details', error)
    );
  }
});

// exports.Booking = catchAsync(async (req, res, next) => {
//   const {
//     email,
//     firstName,
//     lastName,
//     cityName,
//     address,
//     streetNumber,
//     phone,
//     paymentMethod,
//   } = req.body;
//   const user = req.user.id;

//   if (!req.paid) {
//     return next(new AppError('Payment Failed', 404));
//   }

//   // Get the user's cart details and populate the cars field
//   const userCart = await Cart.findOne({ user }).populate('cars.car');

//   if (!userCart) {
//     return next(new AppError('Cart not found', 404));
//   }

//   // Calculate the total amount based on cart cars
//   let totalAmount = 0;
//   const cars = userCart.cars.map((cartItem) => {
//     const car = cartItem.car;
//     const quantity = cartItem.quantity;
//     const carTotalAmount = quantity * car.salePrice;
//     totalAmount += carTotalAmount;
//     return {
//       car: car._id,
//       quantity,
//       carTotalAmount,
//     };
//   });

//   const booking = new AdditionalBooking({
//     user,
//     cars,
//     totalAmount,
//     email,
//     firstName,
//     lastName,
//     cityName,
//     address,
//     streetNumber,
//     phone,
//     paymentMethod,
//   });
//   booking.paymentStatus = 'Done';
//   await booking.save();

//   res.status(201).json({
//     status: 'Success',
//     message: 'Car Booking Created!',
//     booking,
//   });
// });

// Get all bookings
exports.getAllAdditionalBooking = catchAsync(async (req, res, next) => {
  const additionalBookings = await AdditionalBooking.find();
   
  res.status(200).json({
    status: 'Success',
    additionalBookingDetails: additionalBookings || `No Car Found`,
  });
});

exports.getSpecificCustomerAllAdditionalBooking = catchAsync(
  async (req, res, next) => {
    const userId = req.params.id;

    const additionalBookings = await AdditionalBooking.find({
      customerId: userId,
    });
    if (additionalBookings.length > 0) {
      res.status(200).json({
        status: 'success',
        additionalBookingDetails: additionalBookings,
      });
    } else {
      return next(new AppError(`No Booking found for user ${userId}`));
    }
  }
);

// Update booking status By Seller
exports.updateAdditionalBooking = catchAsync(async (req, res, next) => {

  const additionalBooking = await AdditionalBooking.findById(req.params.id);

  if (!additionalBooking) {
    return next(new AppError("Booking not found", 404));
  }
  
  console.log("1- additionalBooking.customerId.toString() ", additionalBooking.customerId.toString())
  console.log("2- req.user.id is: ", req.user.id)

  if (additionalBooking.customerId.toString() !== req.user.id) {
    return next(new AppError("You are not authorized to update this booking", 403));
  }

  const additionalBookings = await AdditionalBooking.updateOne(
    { _id: req.params.id },
    { $set: req.body }
  );
  if (additionalBookings) {
    res.status(200).json({
      status: 'success',
      message: 'Additional Booking updated successfully',
    });
  } else {
    return next(
      new AppError(
        "Can't Update additional booking details. As No entry found with such id"
      )
    );
  }
});

exports.deleteAdditionalBooking = catchAsync(async (req, res, next) => {
  const additionalBooking = await AdditionalBooking.findByIdAndDelete(
    req.params.id
  );
  if (additionalBooking) {
    res.status(200).json({
      status: 'success',
      message: 'Additional Booking deleted successfully',
    });
  } else {
    return next(
      new AppError(
        "Can't Delete Additional Booking. As No entry found with such id"
      )
    );
  }
});

exports.getoneAdditionalBooking = Factory.getOne(AdditionalBooking);
