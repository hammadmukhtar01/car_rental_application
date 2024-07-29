const express = require('express');
const customerController = require('../controllers/customer/customerController');
const customerauthController = require('../controllers/customer/customerauthController');
const multer = require('multer');
const router = express.Router();
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router.route('/all').get(customerController.getAllUsers);

// router.route('/create').post(customerauthController.signup, customerauthController.sendEmailConfirm);
router.route('/create').post(upload.single('customerProfileImg'), customerauthController.signup);

router.route('/login').post(customerauthController.login);
router
  .route('/resetpassword/:token')
  .patch(customerauthController.resetPassword);
router.route('/forgotpassword').post(customerauthController.forgotPassword);
router.route('/delete/:id').delete(customerController.deleteCustomer);
router.patch('/update/:id', customerauthController.updateStatus);
router.patch(
  '/updateprofile/:id',
  customerauthController.updateCustomerProfile
);

// router.patch('/emailconfirm/:token', customerauthController.emailConfirm);

router.patch(
  '/updatepassword',
  customerauthController.protect,
  customerauthController.updatePass
);

router
  .route('/profile/:id')
  .get(
    customerauthController.protect,
    // customerauthController.verifyProfileOwnership,
    customerController.getProfile
  );

module.exports = router;
