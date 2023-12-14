const logger = require('morgan');
const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

const adminRouter = require('./routes/adminRoute');
const customerRouter = require('./routes/customerRoute');
const carRouter = require('./routes/carRoute');
const AppError = require('./utils/appError');
const globalErrHandler = require('./controllers/errorController');

dotenv.config({ path: './config.env' });

const app = express();

 

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

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
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// routes
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/customer', customerRouter);
app.use('/api/v1/car', carRouter);

// app.all('*', (req, res, next) => {
//   next(new AppError(`Cant find the provided route: ${req.originalUrl}`));
// });

// app.use(globalErrHandler);

module.exports = app;
