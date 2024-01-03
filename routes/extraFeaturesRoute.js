const express = require('express');
const extraFeaturesController = require('../controllers/car/extraFeaturesController');
const adminauthController = require('../controllers/admin/adminauthController');
const router = express.Router();

router.route('/create').post(adminauthController.protect, extraFeaturesController.createExtraFeatures);
router.route('/updateExtraFeatures/:id').patch(adminauthController.protect, extraFeaturesController.updateExtraFeatures);

router.route('/deleteExtraFeatures/:id').delete(adminauthController.protect, extraFeaturesController.deleteSingleExtraFeatures);

router.route('/all').get(extraFeaturesController.getAllExtraFeatures);
router.route('/one/:id').get(extraFeaturesController.getSingleExtraFeatures);


module.exports = router;
