const express = require('express');
const couponController = require('../controllers/coupon/couponController');
const adminauthController = require('../controllers/admin/adminauthController');
const router = express.Router();

router.route('/create').post(adminauthController.protect, couponController.createCoupon);
router.route('/updateCoupon/:id').patch(adminauthController.protect, couponController.updateCoupon);

router.route('/deleteCoupon/:id').delete(adminauthController.protect, couponController.deleteSingleCoupon);

router.route('/all').get(couponController.getAllCoupon);
router.route('/one/:id').get(couponController.getSingleCoupon);


module.exports = router;
