const express = require('express');
const reviewController = require('../controllers/review/reviewController');
const customerauthController = require('../controllers/customer/customerauthController');

const router = express.Router({ mergeParams: true });


router.route('/').get(reviewController.getAllReviews);

router.use(customerauthController.protect);

router
  .route('/create/:id')
  .post(reviewController.setProductUser, reviewController.createReview);

router.route('/:id').get(reviewController.getReview);
router.route('/customer/:customerId').get(reviewController.getReviewsByCustomer);
router.route('/car/:carId').get(reviewController.getReviewsByCar);

module.exports = router;