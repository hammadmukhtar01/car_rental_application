const express = require('express');
const addOnsController = require('../controllers/addOns/addOnsController');
const adminauthController = require('../controllers/admin/adminauthController');
const router = express.Router();

router.route('/create').post(adminauthController.protect, addOnsController.createAddOns);
router.route('/updateAddOns/:id').patch(adminauthController.protect, addOnsController.updateAddOns);

router.route('/deleteAddOns/:id').delete(adminauthController.protect, addOnsController.deleteSingleAddOns);

router.route('/all').get(addOnsController.getAllAddOns);
router.route('/one/:id').get(addOnsController.getSingleAddOns);


module.exports = router;
