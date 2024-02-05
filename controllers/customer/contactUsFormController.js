const ContactUsForm = require('../../models/contactUsFormModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const sendEmail = require('../../utils/email');
const factory = require('../factoryHandler');

exports.createContactUsRequest = catchAsync(async (req, res, next) => {
  const { fname, lname, email, phoneNumber, comment } = req.body;

  const newContactUsForm = await ContactUsForm({
    fname,
    lname,
    email,
    phoneNumber,
    comment,
  });

  await newContactUsForm.save();

  const message = `Thank you, ${fname} ${lname}, for Contacting Milele. We will get back to you soon!`;

  try {
    await sendEmail({
      email: newContactUsForm.email,
      subject: 'Milele Car Rental ',
      message,
    });
    res.status(200).json({
      status: 'success',
      message:
        'Form submitted successfully. Check your email for further discussion.',
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

exports.getAllContactUsForms = catchAsync(async (req, res, next) => {
  try {
    const contactUsFormDetail = await ContactUsForm.find();
    res.status(200).json({
      status: 'Success',
      contactUsFormData: contactUsFormDetail || `No Contact Us Form Data Found`,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError('Error while fetching Contact Us Form Data', error)
    );
  }
});

exports.getSingleContactUsForms = factory.getOne(ContactUsForm);
