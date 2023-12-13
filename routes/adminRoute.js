const express = require('express');
const adminController = require('../controllers/admin/adminController');
const adminauthController = require('../controllers/admin/adminauthController');

const router = express.Router();

// router.route('/users').get(userController.getAllUsers);

router.post('/create', adminauthController.signup);
// router.route('/create').post(adminauthController.signup, adminauthController.sendEmailConfirm);

router.delete(
  '/delete/:id',
  adminauthController.protect,
  adminController.deleteAdmin
);

router.get(
  'getalladmins',
  adminauthController.protect,
  adminController.getAllUsers
);

router.route('/login').post(adminauthController.login);
router.route('/resetpassword/:token').patch(adminauthController.resetPassword);
router.route('/forgotpassword').post(adminauthController.forgotPassword);
router.patch('/update/:id', adminauthController.updateStatus);
// router.patch('/emailconfirm/:token', adminauthController.emailConfirm);

router.patch(
  '/updatepassword',
  adminauthController.protect,
  adminauthController.updatePass
);

router
  .route('/profile')
  .get(adminauthController.protect, adminController.getProfile);

module.exports = router;
