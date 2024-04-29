const express = require('express');
const router = express.Router();
const networkAPIIntegrationController = require('../controllers/networkAPIIntegration/networkAPIIntegrationController');

router
  .route('/createPaymentInvoice')
  .post(networkAPIIntegrationController.createNetworkPayInvoice);

module.exports = router;
