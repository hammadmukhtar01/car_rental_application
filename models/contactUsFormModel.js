const mongoose = require('mongoose');
const validator = require('validator');

const contactUsFormSchema = mongoose.Schema(
  {
    fname: {
      type: String,
      minlength: [3, 'must have greater or equal to 3 length'],
      maxlength: [50, 'must have less or equal to 50 length'],
      required: [true, 'First Name is missing'],
    },
    lname: {
      type: String,
      minlength: [3, 'must have greater or equal to 3 length'],
      maxlength: [50, 'must have less or equal to 50 length'],
      required: [true, 'Last Name is missing'],
    },
    email: {
      type: String,
      required: [true, 'Must have a email'],
      validate: [validator.isEmail, 'Enter valid email'],
      lowercase: true,
    },

    phoneNumber: {
      type: String,
      // match: /^(\()?\d{3}(\))?(-|\s)?\d{7}$/,
      minlength: [10, 'must have greater or equal to 10 length'],
      maxlength: [15, 'must have less or equal to 11 length'],
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
