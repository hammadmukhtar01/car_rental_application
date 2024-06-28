const ContactUsForm = require('../../../models/contactUsFormModel');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');
const sendEmail = require('../../../utils/email');
const factory = require('../../factoryHandler');

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

  const customerMessage = `Thank you ${fname} ${lname}, for contacting Milele Car Rental team. We will get back to you soon!!!`;
  const rentalTeamMessage = `Dear rental team, a new customer just filled the Contact Us form with following details:\n\nCustomer: \t"${fname} ${lname}" \nEmail: \t\t${email}, \nPhone No.: \t${phoneNumber}, \nComments: \t"${comment}"`;

  try {
    await sendEmail({
      email: email,
      subject: 'Thank you for Contacting Us',
      message: customerMessage,
      fname: fname,
      lname: lname,
      isHtml: true,
    });

    await sendEmail({
      email: ['hammad.mukhtar@milele.com', 'hammadmukhtar1122@gmail.com'],
      subject: 'New Contact Us Inquiry',
      message: rentalTeamMessage,
      fname: 'Rental',
      lname: 'Team',
      isHtml: false, 
    });

    res.status(200).json({
      status: 'success',
      message:
        'Form submitted successfully. Check your email for confirmation.',
      data: newContactUsForm,
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
