const express = require('express');
const simpleFeatureController = require('../controllers/car/simpleFeaturesController');
const adminauthController = require('../controllers/admin/adminauthController');
const router = express.Router();

router
  .route('/create')
  .post(adminauthController.protect, simpleFeatureController.createSimpleFeature);
router
  .route('/update/:id')
  .patch(adminauthController.protect, simpleFeatureController.updateSimpleFeature);
router
  .route('/all')
  .get(simpleFeatureController.getAllSimpleFeatures);
router
  .route('/one/:id')
  .get(simpleFeatureController.getSingleSimpleFeature);
router
  .route('/delete/:id')
  .delete(
    adminauthController.protect,
    simpleFeatureController.deleteSingleSimpleFeature
  );

module.exports = router;
