const mongoose = require('mongoose');
const validator = require('validator'); 

const freeConsultationFormSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'must have full name '],
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const FreeConsultationForm = mongoose.model(
  'FreeConsultationForm',
  freeConsultationFormSchema
);

module.exports = FreeConsultationForm;
