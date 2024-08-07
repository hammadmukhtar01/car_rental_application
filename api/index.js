const logger = require('morgan');
const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');
const serverless = require('serverless-http');

const adminRouter = require('../routes/adminRoute');
const customerRouter = require('../routes/customerRoute');
const carRouter = require('../routes/carRoute');
const additionalBookingRouter = require('../routes/additionalBookingRoute');
const bookingRouter = require('../routes/bookingRoute');
const reviewRouter = require('../routes/reviewRoute');
const simpleFeatureRouter = require('../routes/simpleFeaturesRoute');
const complexFeatureRouter = require('../routes/complexFeaturesRoute');
const couponRouter = require('../routes/couponRoute');
const addOnsRouter = require('../routes/addOnsRoute');
const extraFeaturesRouter = require('../routes/extraFeaturesRoute');
const contactUsFormRouter = require('../routes/contactUsFormRoute');
const networkPaymentAPIRouter = require('../routes/networkAPIIntegrationRoute');
const leaseNowuserDataRouter = require('../routes/leaseNowuserDataRoute');
const freeConsultationFormDataRouter = require('../routes/freeConsultationFormRoute');
const {
  notFoundHandler,
  globalErrHandler,
} = require('../controllers/errorController');

dotenv.config({ path: './../config.env' });

const app = express();

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

app.use(express.static(path.join(__dirname, '/uploads')));

app.use(cors());

app.options('*', cors());

app.use(logger('dev'));
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  req.requestBody = new Date().toISOString();
  next();
});
// app.use(express.bodyParser({ limit: '50mb' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
// app.use('/api/v1/admin', adminRouter);
app.get('/', (req, res) => {
  res.send('Default URL Home Page Backend 5: 04 pm (Date: 07-June, 2024)');
});
app.get('/hello', (req, res) => {
  res.send('Hello, world API!');
});
app.use('/api/v1/customer', customerRouter);
app.use('/api/v1/car', carRouter);
app.use('/api/v1/additionalBooking', additionalBookingRouter);
app.use('/api/v1/booking', bookingRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/simpleFeature', simpleFeatureRouter);
app.use('/api/v1/complexFeature', complexFeatureRouter);
app.use('/api/v1/coupon', couponRouter);
app.use('/api/v1/addOns', addOnsRouter);
app.use('/api/v1/extraFeatures', extraFeaturesRouter);
app.use('/api/v1/contactUsForm', contactUsFormRouter);
app.use('/api/v1/invoice', networkPaymentAPIRouter);
app.use('/api/v1/leaseNowData', leaseNowuserDataRouter);
app.use('/api/v1/freeConsultationForm', freeConsultationFormDataRouter);
// app.post('/set-404-status', (req, res) => {
//   res.status(404).end();
// });

app.use((req, res, next) => {
  res
    .status(404)
    .sendFile(path.join(__dirname, 'milelecarrental.com', 'pageNotFound.html'));
});

module.exports = app;
module.exports.handler = serverless(app);
