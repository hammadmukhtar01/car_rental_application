const express = require('express');

const router = express.Router();
const bookingController = require('../controllers/booking/bookingController');
const adminauthController = require('../controllers/admin/adminauthController');
const customerauthController = require('../controllers/customer/customerauthController');
const payment = require('../controllers/payment');

router.post(
  '/create',
  customerauthController.protect,
  payment.payment,
  bookingController.createBooking
);
router.get('/all', bookingController.getAllBookings);
router.get('/one/:id', bookingController.getonebooking);
router.get('/:id/userSpecificAllBookings', bookingController.userSpecificAllBookings);

router.patch(
  '/update/:id',
  adminauthController.protect,
  adminauthController.restrictTo('admin'),
  bookingController.bookingStatus
);
// router.delete('/delete/:id', bookingController.deleteBooking);

module.exports = router;
