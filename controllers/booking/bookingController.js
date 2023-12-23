const Booking = require('../../models/bookingModel');
const AdditionalBooking = require('../../models/additionalBookingDetailsModel');
const Customer = require('../../models/customerModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const Factory = require('../factoryHandler');

// Create a new booking
exports.createBooking = catchAsync(async (req, res, next) => {
  const { additionalBookingDetailsId, cardholderName } = req.body;
  console.log('Additional booking id ', additionalBookingDetailsId);

  if (!req.paid) {
    return next(new AppError('Payment Failed', 404));
  }
  const additionalBookingDetails = await AdditionalBooking.findById(
    additionalBookingDetailsId
  );

  if (!additionalBookingDetails) {
    return next(new AppError('Additional Booking Details not found', 404));
  }
  const { carId, customerId } = additionalBookingDetails;

  console.log("caar id is ", carId, "custoemr id is", customerId)

  const booking = new Booking({ additionalBookingDetailsId, cardholderName, carId, customerId });
  booking.paymentStatus = 'Done';

  await booking.save();

  res.status(201).json({
    status: 'Success',
    message: 'Car Booking Created!',
    booking,
  });
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

//   const booking = new Booking({
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
exports.getAllBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find();
  
  res.status(200).json({
    status: 'Success',
    booking: bookings || `No Car Found`,
  });
});

// Update booking status By Seller
exports.bookingStatus = catchAsync(async (req, res, next) => {
  const bookingId = req.params.id;
  const bookingStatus = req.body;

  const booking = await Booking.findByIdAndUpdate(bookingId, bookingStatus, {
    new: true,
  });
  if (!booking) {
    return next(new AppError("Can't find booking with the provided ID", 404));
  }
  console.log('Booking in boooked status update is :', booking);

  const additionalBookingId = booking.additionalBookingDetailsId;
  const additionalBooking = await AdditionalBooking.findById(
    additionalBookingId
  );
  if (!additionalBooking) {
    return next(
      new AppError("Can't find AdditionalBooking with the provided ID", 404)
    );
  }

  const totalPaidAmount = additionalBooking.totalPrice || 0;

  const customer_Id = additionalBooking.customerId;
  const customer = await Customer.findById(customer_Id);
  console.log('1 customer id in boooked status update is :', customer);

  if (customer) {
    await customer.updateCreditPoints(totalPaidAmount);
    console.log('2 customer id in boooked status update is :', customer);

  }

  res.status(200).json({
    status: 'success',
    message: 'Booking status updated successfully',
    booking,
  });
});

exports.userSpecificAllBookings = catchAsync(async (req, res, next) => {

  const userId = req.params.id; 
  const bookings = await Booking.find({ customerId: userId })

  res.status(200).json({
    status: 'Success',
    bookings: bookings || `No Bookings Found for the User`,
  });
});


exports.deleteBooking = catchAsync(async (req, res, next) => {
  const bookings = await Booking.findByIdAndDelete(req.params.id);
  if (bookings) {
    res.status(200).json({
      status: 'success',
      message: 'Booking deleted successfully',
    });
  } else {
    return next(
      new AppError("Can't Delete Booking. As No Booking found with such id")
    );
  }
});

exports.getonebooking = Factory.getOne(Booking);
