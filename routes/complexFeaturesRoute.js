const express = require('express');
const complexFeatureController = require('../controllers/car/complexFeaturesController');
const adminauthController = require('../controllers/admin/adminauthController');
const router = express.Router();

router
  .route('/create')
  .post(adminauthController.protect, complexFeatureController.createComplexFeature);
router
  .route('/update/:id')
  .patch(adminauthController.protect, complexFeatureController.updateComplexFeature);
router
  .route('/all')
  .get(complexFeatureController.getAllComplexFeatures);
router
  .route('/one/:id')
  .get(complexFeatureController.getSingleComplexFeature);
router
  .route('/delete/:id')
  .delete(
    adminauthController.protect,
    complexFeatureController.deleteSingleComplexFeature
  );

module.exports = router;
