const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Customer = require('../../models/customerModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const sendEmail = require('../../utils/email');

const signInToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};

const signInUser = (user, statuscode, res, successMessage) => {
  const token = signInToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.EXPIRES_COOKIE_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  const response = {
    status: 'success',
    token,
    data: {
      name: user.name,
      role: user.role,
      status: user.isVerified,
      _id: user._id,
    },
  };

  if (successMessage) {
    response.message = successMessage;
  }
  res.status(statuscode).json(response);
};

const signInNewUser = (user, statuscode, res) => {
  const token = signInToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.EXPIRES_COOKIE_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
};

const sendThankYouEmail = async (user) => {
  const message = `Thank you for signing up, ${user.name}! We appreciate your registration with Milele Car Rental System. \nClick the below link to visit our website:\nhttps://milelecarrental.com`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Thank You for Signing Up!',
      message,
    });
  } catch (err) {
    AppError('Error sending thank-you email:', err);
  }
};

exports.signup = catchAsync(async (req, res, next) => {
  const customerCheck = await Customer.findOne({
    email: req.body.email,
  });
  if (customerCheck)
    return next(
      new AppError('This Email is already registered as customer', 400)
    );

  const newUser = await Customer.create({
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    location: req.body.location,
    cityName: req.body.cityName,
  });

  await sendThankYouEmail(newUser);
  req.user = newUser;
  req.token = signInNewUser(newUser._id, 201, res);

  next();

  res.status(201).json({
    status: 'success',
    data: {
      newUser,
    },
    message: 'Thank you for signing up! Check your email for a welcome message.',
  });
});

exports.login = catchAsync(async (req, res, next) => {
  let useremail;
  let phoneNumber;
  const { email, password } = req.body;

  if (!email || !password) {
    // console.log('hi');
    return next(new AppError('Account or password is not entered', 400));
  }

  if (email.includes('@')) {
    useremail = req.body.email;
  } else if (!email.includes('@')) {
    phoneNumber = req.body.email;
  }

  // const user = await User.findOne({ email }).select('+password');

  const user1 = await Customer.findOne({
    $or: [{ email: useremail }, { phoneNumber: phoneNumber }],
  }).select('+password');
  if (!user1 || !(await user1.correctPassword(password, user1.password))) {
    // console.log('hi');
    return next(new AppError('Account or password is not correct', 401));
  }

  if (!user1.isVerified)
    return next(new AppError('User is not Verified!', 400));

  signInUser(user1, 201, res, 'Password updated successfully');

  // const token = signInToken(user._id);
  // res.status(201).json({
  //   status: 'success',
  //   token,
  // });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in please login to view the data', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await Customer.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('User belonging to this token no longer exist', 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed Password please re login!')
    );
  }
  req.user = currentUser;

  next();
});

exports.restrictTo = function (...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have persmision to perform this action')
      );
    }
    next();
  };
};

exports.updateStatus = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const { isVerified } = req.body;

  const customer = await Customer.findByIdAndUpdate(
    id,
    { isVerified },
    { new: true }
  );

  if (!customer) {
    return next(new AppError('Customer not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Customer status updated',
    data: {
      customer,
    },
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await Customer.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError('User with this email not found please enter valid one!')
    );
  }

  const resetToken = user.passwordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/customer/resetpassword/${resetToken}`;

  const message = `Forgot your password? submit patch request on the given link for the new password ${resetURL} \n If you dont do this please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your token is valid for 30 mins',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to the email provided',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was error sending email please try again later!', 500)
    );
  }
});

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

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await Customer.findOne({
    passResetToken: hashedToken,
    passTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Your token is invalid or expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passResetToken = undefined;
  user.passTokenExpire = undefined;
  await user.save();

  signInUser(user, 201, res);
  return next(new AppError('Password has been Updated', 401));
});

exports.updatePass = catchAsync(async (req, res, next) => {
  const user = await Customer.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is incorrect!', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  signInUser(user, 201, res);
});

// exports.sendEmailConfirm = catchAsync(async (req, res, next) => {
//   const user = await Customer.findOne({ email: req.body.email });
//   console.log('User in send email verification is :', user);

//   if (!user) {
//     return next(new AppError('Email not found Please enter a valid one!'));
//   }

//   const EmailToken = user.emailResetToken();
//   console.log('Email Token is : ', EmailToken);

//   await user.save({ validateBeforeSave: false });

//   const resetURL = `${req.protocol}://${req.get(
//     'host'
//   )}/api/v1/customer/emailconfirm/${EmailToken}`;

//   const message = `Welcome to the Milele Car Rental System! Click on the given link to verify your account:  ${resetURL} \n If you dont do this please ignore this email`;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: 'Email Confirmation',
//       message,
//     });
//     res.status(200).json({
//       status: 'success',
//       token: req.token,
//       message: 'Welcome! Account Confirmation link sent to your email',
//     });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passTokenExpire = undefined;
//     await user.save({ validateBeforeSave: false });

//     return next(
//       new AppError('There was error sending email please try again later!', 500)
//     );
//   }
// });

// exports.emailConfirm = catchAsync(async (req, res, next) => {
//   const hashedToken = crypto
//     .createHash('sha256')
//     .update(req.params.token)
//     .digest('hex');

//   const user = await Customer.findOne({
//     confirmEmailToken: hashedToken,
//   });
//   console.log(`user is ${user} and token of the user is ${hashedToken}`);
//   if (!user) {
//     return next(new AppError('Your token is invalid', 400));
//   }
//   user.phoneNumber = req.params.phoneNumber;
//   user.role = user.temprole;
//   user.isVerified = true;
//   user.confirmEmailToken = undefined;
//   user.temprole = undefined;
//   await user.save({ validateBeforeSave: false });

//   signInUser(user._id, 201, res);
// });
