const handleCastError = (err, res) => {
  const isMessage = `Invalid ${err.path} route`;

  res.status(400).json({
    status: 'fail',
    message: isMessage,
  });
};

const handlesJWTErrorExpired = (res) => {
  res.status(401).json({
    status: 'fail',
    message: 'Your token is expired. Please re-login!',
  });
};

const handlesDBError = (err, res) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const isDBMessage = `Invalid ${errors.join('. ')}`;

  res.status(500).json({
    status: 'fail',
    message: isDBMessage,
  });
};

const errorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const handlesJWTError = (res) => {
  res.status(401).json({
    status: 'fail',
    message: 'Your token is invalid. Please re-login!',
  });
};

const errorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'fail',
      message: err,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'failed';

  // if (process.env.NODE_ENV === 'development') {
  //   errorDev(err, res);
  // }

  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    console.log("Node env mode is: ", process.env.NODE_ENV)
    let error = { ...err };

    switch (error.name) {
      case 'CastError':
        handleCastError(error, res);
        break;
      case 'ValidationError':
        handlesDBError(error, res);
        break;
      case 'JsonWebTokenError':
        handlesJWTError(res);
        break;
      case 'TokenExpiredError':
        handlesJWTErrorExpired(res);
        break;
      default:
        errorProd(error, res);
    }
  }
};

