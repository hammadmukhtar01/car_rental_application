const Review = require('../../models/reviewModel');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../factoryHandler');
const Car = require('../../models/carModel');
const Booking = require('../../models/bookingModel');

exports.setProductUser = catchAsync(async (req, res, next) => {
  const car = req.params.id;
  const customer = req.user.id;

  const productExists = await Car.exists({ _id: car });
  if (!productExists) {
    return res.status(404).json({
      status: 'Failing',
      message: 'Car not found.....',
    });
  }
  console.log('BookingExists');

  const BookingExists = await Booking.exists({
    carId: car,
    customerId: customer,
  });
  console.log(`Booking exist value: ${BookingExists}`);

  console.log(' Valid car values and custoemr values ', car, customer);

  if (!BookingExists) {
    return res.status(403).json({
      status: 'failed',
      message: "You can't give reviews to Un Booked car ...",
    });
  }

  req.body.carId = car;
  req.body.customerId = customer;
  // next();
  const review = await Review.create(req.body);
  console.log('reviews are: ', review);

  res.status(200).json({
    status: 'success',
    data: {
      reviews: review,
    },
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  try {
    const reviews = await Review.find();
    console.log(`Reviews are: ${reviews.length}`, reviews);

    res.status(200).json({
      status: 'success',
      data: {
        reviews,
      },
    });
  } catch (error) {
    // Handle any errors that occur
    res.status(401).json({
      status: 'Failed',
      message: 'No Reviews found..',
      error
    });
  }
});

exports.getReviewsByCustomer = catchAsync(async (req, res, next) => {
  const customerId = req.params.customerId;

  const reviews = await Review.find({ customerId });

  res.status(200).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

exports.getReviewsByCar = catchAsync(async (req, res, next) => {
  const carId = req.params.carId;

  const reviews = await Review.find({ carId });

  res.status(200).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
