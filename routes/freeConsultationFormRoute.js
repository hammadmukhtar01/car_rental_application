const express = require('express');
const router = express.Router();
const freeConsultationFormController = require('../controllers/carRentalAPIs/freeConsultationForm/freeConsultationFormController');

router
  .route('/create')
  .post(freeConsultationFormController.createFreeConsultationForm);

router
  .route('/all')
  .get(freeConsultationFormController.getAllFreeConsultationForms);
router
  .route('/one/:id')
  .get(freeConsultationFormController.getSingleConsultationForm);

module.exports = router;
