const express = require('express');
const customerController = require('../controllers/customer/customerController');
const customerauthController = require('../controllers/customer/customerauthController');

const router = express.Router();

router.route('/all').get(customerController.getAllUsers);

// router.route('/create').post(customerauthController.signup, customerauthController.sendEmailConfirm);
router.route('/create').post(customerauthController.signup);

router.route('/login').post(customerauthController.login);
router.route('/resetpassword/:token').patch(customerauthController.resetPassword);
router.route('/forgotpassword').post(customerauthController.forgotPassword);
router.route('/delete/:id').delete(customerController.deleteCustomer);
router.patch('/update/:id', customerauthController.updateStatus);

// router.patch('/emailconfirm/:token', customerauthController.emailConfirm);

router.patch(
  '/updatepassword',
  customerauthController.protect,
  customerauthController.updatePass
);

router
  .route('/profile/:id')
  .get(customerauthController.protect, customerController.getProfile);

module.exports = router;
