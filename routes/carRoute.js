const express = require('express');
const carController = require('../controllers/car/carController');
const adminauthController = require('../controllers/admin/adminauthController');
const router = express.Router();

router.route('/createCar').post(adminauthController.protect, carController.createCar);
router.route('/updateCar/:id').patch(adminauthController.protect, carController.updateCar);

// router.route('/deleteCar/:id').delete(carController.deleteSingleCar);

router.route('/all').get(carController.getAllCars);
router.route('/getSingleCar/:id').get(carController.getSingleCar);


module.exports = router;
