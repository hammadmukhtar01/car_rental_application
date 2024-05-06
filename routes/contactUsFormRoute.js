const express = require('express');
const router = express.Router();
const ContactUsFormController = require('../controllers/carRentalAPIs/contactUs/contactUsFormController');

router.route('/create').post(ContactUsFormController.createContactUsRequest);

router.route('/all').get(ContactUsFormController.getAllContactUsForms);
router.route('/one/:id').get(ContactUsFormController.getSingleContactUsForms);

module.exports = router;
