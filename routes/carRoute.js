const express = require('express');
const carController = require('../controllers/car/carController');
const adminauthController = require('../controllers/admin/adminauthController');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = path.extname(file.originalname);
      const filename = `${uniqueSuffix}.${extension}`;
      cb(null, filename); 
    },
  });

const upload = multer({ storage });

router.route('/createCar').post(adminauthController.protect,upload.array('carImages', 12), carController.createCar, );
router.route('/updateCar/:id').patch(adminauthController.protect, carController.updateCar);

// router.route('/deleteCar/:id').delete(carController.deleteSingleCar);

router.route('/all').get(carController.getAllCars);
router.route('/getSingleCar/:id').get(carController.getSingleCar);

// const upload = multer({ dest: 'uploads/' });

// router.post('/testUpload', upload.array('carImages'), (req, res) => {
//   console.log('Uploaded Files:', req.files);
//   res.json({ status: 'success', message: 'Files uploaded successfully.' });
// });



module.exports = router;
