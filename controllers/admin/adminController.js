const catchAsync = require('../../utils/catchAsync');
const Admin = require('../../models/adminModel');
const AppError = require('../../utils/appError');
const Factory = require('../factoryHandler');
const { find } = require('../../models/adminModel');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const user = await Admin.find();

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
  const user = await Admin.findById(req.user.id);

  if (!user) {
    return next(
      res.status(404).json({
        status: 'fail',
        message: 'No user found with such id',
      })
    );

    // return next(new AppError('No user found with such id'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteAdmin = catchAsync(async (req, res, next) => {
  const admin = await Admin.find();

  if (admin.length === 1)
    return next(
      res.status(404).json({
        status: 'fail',
        message:
          'You cannot delete yourself while there is not other Admin. Please make another admin in order to delete yourself',
      })
    );

  // return next(
  //   new AppError(
  //     'You cannot delete yourself while there is not other Admin. Please make another admin inorder to delete yourself',
  //     400
  //   )
  // );

  await Admin.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Deleted Successfully',
  });
});
