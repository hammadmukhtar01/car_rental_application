const FreeConsultationForm = require('../../../models/freeConsultationFormModel');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');
const sendEmail = require('../../../utils/email');
const factory = require('../../factoryHandler');
const { parsePhoneNumberFromString } = require('libphonenumber-js');

exports.createFreeConsultationForm = catchAsync(async (req, res, next) => {
  const { customerName, phoneNumber } = req.body;

  const phoneNumberObj = parsePhoneNumberFromString(`+${phoneNumber}`);

  if (!phoneNumberObj || !phoneNumberObj.isValid()) {
    return next(
      new AppError('Invalid Phone No.!', 400),
      res.status(400).json({
        status: 'fail',
        message: 'Invalid Phone No.!',
      })
    );
  }

  const newFreeConsultationForm = await FreeConsultationForm({
    customerName,
    phoneNumber: phoneNumberObj?.number,
  });

  const FreeConsultationFormData = await newFreeConsultationForm.save();

  const message = `New Customer is trying to get consultation. Details are: \n\nCustomer Name: \t${customerName} \nPhone Number: \t+${phoneNumber}. \n\nPlease get back to them as soon as possible!`;

  try {
    await sendEmail({
      email: ['hammad.mukhtar@milele.com', 'milelecarrental@gmail.com'],
      subject: 'New Consultation Inquiry',
      message,
      fName: 'Rental',
      lName: 'Team',
      isHtml: false,
    });
    res.status(200).json({
      status: 'success',
      data: FreeConsultationFormData,
      message:
        'Consultation Form submitted successfully. We will get back to you soon.',
    });
  } catch (err) {
    return next(
      new AppError(
        new AppError(
          'There was an error sending the email. Please try again later.',
          500
        ),
        res.status(500).json({
          status: 'fail',
          message:
            'There was an error sending the email. Please try again later.',
        })
      )
    );
  }
});

exports.getAllFreeConsultationForms = catchAsync(async (req, res, next) => {
  try {
    const freeConsultationFormDetail = await FreeConsultationForm.find();
    res.status(200).json({
      status: 'Success',
      data: freeConsultationFormDetail || `No Consultation Form Data Found`,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while fetching Consultation Form Data', error)
    );
  }
});

exports.getSingleConsultationForm = factory.getOne(FreeConsultationForm);
