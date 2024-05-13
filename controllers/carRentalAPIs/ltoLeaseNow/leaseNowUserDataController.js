const sendEmail = require('../../../utils/email');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');
const factory = require('../../factoryHandler');
const LeaseNowUserData = require('../../../models/leaseNowUserDataModel');

exports.createLeaseNowuserData = catchAsync(async (req, res, next) => {
  const {
    fname,
    lname,
    email,
    phoneNumber,
    comment,
    estCarPrice,
    durationVal,
    downPaymentVal,
  } = req.body;

  const newLeaseNowUserData = await LeaseNowUserData({
    fname,
    lname,
    email,
    phoneNumber,
    comment,
    estCarPrice,
    durationVal,
    downPaymentVal,
  });

  await newLeaseNowUserData.save();

  const message = `Dear ${fname} ${lname}, your leasing details has been sent to our rental department. We will get back to you soon! Thank you!`;

  try {
    await sendEmail({
      email: await newLeaseNowUserData.email,
      subject: 'Leasing Car Details',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Leasing Car Details Data has been saved successfully.',
    });
  } catch (err) {
    return next(
      new AppError(
        'There was an error sending the email. Please try again later.',
        500
      )
    );
  }
});

exports.getAllUsersLeasingData = catchAsync(async (req, res, next) => {
  try {
    const leaseNowUserDetail = await LeaseNowUserData.find();
    res.status(200).json({
      status: 'Success',
      data: leaseNowUserDetail || `No Leasing User Data Found`,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError('Error while fetching Leasing Car Data', error));
  }
});

exports.getSingleUsersLeasingData = factory.getOne(LeaseNowUserData);
