const express = require('express');
const router = express.Router();
const leaseNowUserDataController = require('../controllers/carRentalAPIs/ltoLeaseNow/leaseNowUserDataController');

router.route('/create').post(leaseNowUserDataController.createLeaseNowuserData);
router.route('/all').get(leaseNowUserDataController.getAllUsersLeasingData);
router
  .route('/one/:id')
  .get(leaseNowUserDataController.getSingleUsersLeasingData);

module.exports = router;
