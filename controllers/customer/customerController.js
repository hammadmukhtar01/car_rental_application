const catchAsync = require('../../utils/catchAsync');
const Customer = require('../../models/customerModel');
const AppError = require('../../utils/appError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const user = await Customer.find();

  res.status(200).json({
    status: 'success',
    result: user.length,
    data: {
      user,
    },
  });
});

// exports.getMe = (req, res, next) => {
//   req.params.id = req.user.id;
//   next();
// };

exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await Customer.findById(req.user.id);

  if (!user) {
    return next(new AppError('No user found with such id'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteCustomer = catchAsync(async (req, res, next) => {
  await Customer.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Deleted Successfully',
  });
});
