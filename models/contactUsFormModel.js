const mongoose = require('mongoose');
const validator = require('validator');

const contactUsFormSchema = mongoose.Schema(
  {
    fName: {
      type: String,
      minlength: [3, 'must have greater or equal to 3 length'],
      maxlength: [50, 'must have less or equal to 50 length'],
      required: [true, 'First Name is missing'],
    },
    lName: {
      type: String,
      minlength: [3, 'must have greater or equal to 3 length'],
      maxlength: [50, 'must have less or equal to 50 length'],
      required: [true, 'Last Name is missing'],
    },
    email: {
      type: String,
      required: [true, 'Must have a email'],
      validate: [validator.isEmail, 'Email is In-Valid'],
      lowercase: true,
    },

    phoneNumber: {
      type: String,
      validate: {
        validator: function (value) {
          return validator.isMobilePhone(value, 'any', { strictMode: false });
        },
        message: 'Phone Number is not valid',
      },
      required: [true, 'Phone Number is missing.'],
    },

    comment: {
      type: String,
      required: [true, 'Must have a comment'],
      maxlength: [500, 'Comment must have less or equal to 500 characters'],
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const ContactUsFormSchema = mongoose.model(
  'ContactUsForm',
  contactUsFormSchema
);

module.exports = ContactUsFormSchema;
