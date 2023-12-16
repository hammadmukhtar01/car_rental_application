const express = require('express');

const router = express.Router();
const additionalBookingController = require('../controllers/booking/additionalBookingController');
const customerauthController = require('../controllers/customer/customerauthController');

router.post(
  '/createadditionalBooking',
  customerauthController.protect,
  additionalBookingController.createAdditionalBooking
);
router.get('/one/:id', additionalBookingController.getoneAdditionalBooking);
router.get('/all', additionalBookingController.getAllAdditionalBooking);
router.get('/specificCustomerAllBooking/:id', additionalBookingController.getSpecificCustomerAllAdditionalBooking);

router.patch(
  '/updateadditionalBooking/:id',
  customerauthController.protect,
  customerauthController.restrictTo('customer'),
  additionalBookingController.updateAdditionalBooking
);
router.delete('/delete/:id', additionalBookingController.deleteAdditionalBooking);

module.exports = router;
