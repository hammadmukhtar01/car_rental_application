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

  const customerMessage = `Dear ${fname} ${lname}, your leasing details has been sent to our rental department. We will get back to you soon! Thank you!`;
  const teamMessage = `We just received a query from customer for Car Leasing. Details are:\n\nCustomer Name: \t${fname}, ${lname}\nCustomer Email: \t${email}\nPhone Number: \t${phoneNumber}\nComments: \t${comment}
  \nEstimated Car Price: \t${estCarPrice}\nNo. Of Months: \t${durationVal}\nDown Payment: ${downPaymentVal}%`;

  try {
    await sendEmail({
      email: email,
      subject: 'Leasing Car Details',
      message: customerMessage,
    });
    await sendEmail({
      email: 'hammad.mukhtar@milele.com',
      subject: 'Leasing Car Details Form Submited',
      message: teamMessage,
    });
    res.status(200).json({
      status: 'success',
      message: 'Leasing Car Details Data has been saved successfully.',
      data: newLeaseNowUserData,
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

exports.testingAPI = catchAsync(async (req, res, next) => {
  res.status(200).json({
    message: `This is a test message of API lease Now: ${process.env.DATABASE}`,
  });
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
