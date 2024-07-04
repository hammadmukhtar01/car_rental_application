const AppError = require('../utils/appError');

const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
const handleDuplicateFieldsError = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  return new AppError(
    `Duplicate field value: ${value}. Please use another value!`,
    400
  );
};
const handleValidationError = (err) => {
  console.log('In handleValidationError');
  handleValidationError;

  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Invalid input data: ${errors.join('. ')}`, 400);
};
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again!', 401);

const sendErrorDev = (err, res) => {
  console.log('In sendErrorDev');

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  console.log('In sendErrorProd');
  if (err.isOperational) {
    console.log('In isOperational');
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR ---b :', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log('In module.exports = (err, req, res, next) => {');

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.log('In development');

    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    console.log('In production');

    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateFieldsError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: '404 - Page Not Found',
  });
};

module.exports.notFoundHandler = notFoundHandler;

const globalErrHandler = (err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    err,
  });
};

module.exports.globalErrHandler = globalErrHandler;
