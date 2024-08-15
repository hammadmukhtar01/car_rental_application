const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Customer = require('../../models/customerModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const sendEmail = require('../../utils/email');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const axios = require('axios');

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
      fName: user.fName,
      lName: user.lName,
      nationality: user.nationality?.value,
      role: user.role,
      status: user.isVerified,
      customerIdFromSpeed: user.customerIdFromSpeed,
      customerProfileImg: user.customerProfileImg,
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

const sendThankYouEmail = async (user, textPassword) => {
  try {
    await sendEmail({
      email: user?.email,
      subject: 'Thank You for Signing Up!',
      fname: user?.fName,
      lname: user?.lName,
      password: textPassword,
      type: 'signup',
      isHtml: true,
    });
  } catch (err) {
    new AppError('Error sending thank-you email while signup:', err);
  }
};

exports.signup = catchAsync(async (req, res, next) => {
  let newUser;
  try {
    const customerEmailCheck = await Customer.findOne({
      email: req.body.email,
    });
    if (customerEmailCheck) {
      return next(
        new AppError('This email is already registered.', 400),
        res.status(400).json({
          status: 'fail',
          message: 'This email is already registered.',
        })
      );
    }

    const normalizedContactNum = req.body.phoneNumber.startsWith('+')
      ? req.body.phoneNumber
      : `+${req.body.phoneNumber}`;

    const parsedPhoneNumber = parsePhoneNumberFromString(
      normalizedContactNum,
      req.body.nationality?.value
    );

    // Validate the phone number
    if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
      console.log('Invalid phone number - ', req.body.phoneNumber);
      return res.status(400).json({
        status: 'fail',
        message: 'Please enter a valid phone number.',
      });
    }

    if (req.body.password !== req.body.passwordConfirm) {
      console.log('different passwords');

      return next(
        new AppError('Passwords do not match', 400),
        res.status(400).json({
          status: 'fail',
          message: 'Passwords do not match!',
        })
      );
    }

    const customerPhoneNumCheck = await Customer.findOne({
      phoneNumber: req.body.phoneNumber,
    });
    if (customerPhoneNumCheck) {
      return next(
        new AppError('This phone Number is already registered.', 400),
        res.status(400).json({
          status: 'fail',
          message: 'This phone Number is already registered.',
        })
      );
    }

    if (req.body.password !== req.body.passwordConfirm) {
      console.log('different passwords');

      return next(
        new AppError('Passwords do not match', 400),
        res.status(400).json({
          status: 'fail',
          message: 'Passwords do not match!',
        })
      );
    }

    if (!req.body.nationality) {
      console.log('Please Choose Nationality.');

      return next(
        new AppError('Please Choose Nationality.', 400),
        res.status(400).json({
          status: 'fail',
          message: 'Please Choose Nationality.',
        })
      );
    }

    const plainPassword = req.body.password;

    newUser = await Customer.create({
      fName: req.body.fName,
      lName: req.body.lName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      nationality: req.body.nationality,
      customerIdFromSpeed: req.body.customerIdFromSpeed,
    });

    const token = process.env.SPEED_LOGIN_BEARER_TOKEN;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    console.log('newUser created in OWN DB : ', newUser);

    const speedData = {
      firstName: newUser.fName,
      lastName: newUser.lName,
      mobileNo: newUser.phoneNumber,
      email: newUser.email,
      nationality: newUser.nationality?.label,
      identityDocuments: [
        {
          documentNo: '0',
          identityDocumentType: 4,
          issuedBy: 'United Arab Emirates (the)',
        },
      ],
    };
    console.log('speedData ------ : ', speedData);

    const speedResponse = await axios.post(
      'https://app.speedautosystems.com/api/services/app/person/CreateOrUpdatePerson',
      { person: speedData },
      { headers }
    );
    console.log('speedResponse ------ : ', speedResponse?.data);

    speedCustomerIDFromAPI = speedResponse?.data?.result;
    console.log('speedCustomerIDFromAPI ----- : ', speedCustomerIDFromAPI);

    if (!speedResponse?.data?.success) {
      await Customer.findByIdAndDelete(newUser._id);
      throw (
        (new AppError('Failed to create user in Speed system', 500),
        res.status(500).json({
          status: 'fail',
          message: 'Failed to create user in Speed system',
        }))
      );
    }

    const updatedUserData = await Customer.findByIdAndUpdate(
      newUser._id,
      {
        customerIdFromSpeed: speedResponse.data.result,
      },
      { new: true }
    );

    await sendThankYouEmail(newUser, plainPassword);
    req.user = newUser;
    req.token = signInNewUser(newUser._id, 201, res);

    next();

    res.status(201).json({
      status: 'success',
      data: {
        updatedUserData,
      },
      message:
        'Thank you for signing up! Check your email for a welcome message.',
    });
  } catch (err) {
    console.error('Error during signup:', err);
    if (newUser) {
      await Customer.findByIdAndDelete(newUser._id);
      console.log('Rollback complete: Newly created user has been deleted.');
    }
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        status: 'fail',
        message: err.message,
      });
    } else {
      next(err);
    }
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { emailPhoneNum, password } = req.body;

  if (!emailPhoneNum || !password) {
    // console.log('hi');

    return next(
      new AppError('Email / phone number and password must be provided!', 400),
      res.status(400).json({
        status: 'fail',
        message: 'Email / phone number and password must be provided!',
      })
    );
  }

  let user1;
  if (emailPhoneNum.includes('@')) {
    user1 = await Customer.findOne({ email: emailPhoneNum }).select(
      '+password'
    );
  } else {
    const parsedPhoneNumber = parsePhoneNumberFromString(emailPhoneNum, 'AE');
    if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
      return next(
        new AppError('Invalid phone number format!', 400),
        res.status(400).json({
          status: 'fail',
          message: 'Invalid phone number format!',
        })
      );
    }
    const formattedPhoneNumber = parsedPhoneNumber.format('E.164');
    user1 = await Customer.findOne({
      phoneNumber: formattedPhoneNumber,
    }).select('+password');
  }

  if (!user1 || !(await user1.correctPassword(password, user1.password))) {
    return next(
      new AppError('Email/Phone No. or password is incorrect!', 401),
      res.status(401).json({
        status: 'fail',
        message: 'Email/Phone No. or password is incorrect!',
      })
    );
  }

  // if (!user1.isVerified)
  //   return next(new AppError('User is not Verified!', 400));

  signInUser(user1, 201, res);

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
      new AppError('You are not logged in please login to view the data!', 401),
      res.status(401).json({
        status: 'fail',
        message: 'You are not logged in please login to view the data!',
      })
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await Customer.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('User belonging to this token no longer exist !', 401),
      res.status(401).json({
        status: 'fail',
        message: 'User belonging to this token no longer exist !',
      })
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed Password please re login !', 401),
      res.status(401).json({
        status: 'fail',
        message: 'User recently changed Password please re login !',
      })
    );
  }
  req.user = currentUser;

  next();
});

exports.verifyProfileOwnership = (req, res, next) => {
  if (req.params.id !== req.user.id) {
    return next(
      new AppError('You do not have permission to access this profile', 403),
      res.status(401).json({
        status: 'fail',
        message: 'You do not have permission to access this profile',
      })
    );
  }
  next();
};

exports.restrictTo = function (...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have persmision to perform this action !',
          401
        ),
        res.status(401).json({
          status: 'fail',
          message: 'This You do not have persmision to perform this action !',
        })
      );
    }
    next();
  };
};

exports.findCustomerByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email required.' });
    }

    const customer = await Customer.findOne({ email: email });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.status(200).json({ customer: customer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
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
    return next(
      new AppError('Customer not found !', 404),
      res.status(404).json({
        status: 'fail',
        message: 'Customer not found !',
      })
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Customer status updated',
    data: {
      customer,
    },
  });
});

exports.updateCustomerProfile = catchAsync(async (req, res, next) => {
  try {
    const updatedCustomerData = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCustomerData) {
      return next(
        new AppError('Customer with the given id does not found!', 404),

        res.status(404).json({
          status: 'fail',
          message: 'Customer with the given id does not found!',
        })
      );
    }

    res.status(200).json({
      status: 'success',
      data: updatedCustomerData,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while updating the customer details: ', error),

      res.status(204).json({
        status: 'fail',
        message: `Error while updating the customer details: ${error}`,
      })
    );
  }
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await Customer.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError('Email not found. Please enter a valid email address.', 404),
      res.status(404).json({
        status: 'fail',
        message: 'Email not found. Please enter a valid email address.',
      })
    );
  }

  const resetToken = user.passwordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetURL = `https://milelecarrental.com/resetpassword/${resetToken}`;

  const message = `Forgot your password? Click the given link below for the new password: ${resetURL} \n If you don\'t do this, please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your token is valid for 30 mins',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Password reset link has been sent to the provided email.',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending email please try again later-!',
        500
      ),
      res.status(500).json({
        status: 'fail',
        message: 'There was an error sending email please try again later !',
      })
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
    return next(
      new AppError('Your token is invalid or expired !', 400),
      res.status(400).json({
        status: 'fail',
        message: 'Your token is invalid or expired !',
      })
    );
  }

  if (req.body.password !== req.body.passwordConfirm) {
    return next(
      new AppError('Both passwords should be same !', 400),
      res.status(400).json({
        status: 'fail',
        message: 'Both passwords should be same !',
      })
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passResetToken = undefined;
  user.passTokenExpire = undefined;
  await user.save();

  signInUser(user, 201, res);
  return next(
    new AppError('Password has been Updated !', 401),
    res.status(401).json({
      status: 'fail',
      message: 'Password has been Updated !',
    })
  );
});

exports.updatePass = catchAsync(async (req, res, next) => {
  const user = await Customer.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(
      res.status(401).json({
        status: 'fail',
        message: 'Your current password is incorrect!',
      }),
      new AppError('Your current password is incorrect!', 401)
    );
  }

  if (req.body.password !== req.body.passwordConfirm) {
    return next(
      new AppError('Both passwords should be same !', 400),
      res.status(400).json({
        status: 'fail',
        message: 'Both passwords should be same !',
      })
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  signInUser(user, 201, res, 'Password updated successfully !');
});

// exports.sendEmailConfirm = catchAsync(async (req, res, next) => {
//   const user = await Customer.findOne({ email: req.body.email });
//   console.log('User in send email verification is :', user);

//   if (!user) {
//     return next(new AppError('Email not found Please enter a valid one!', 404));
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
