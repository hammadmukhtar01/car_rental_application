const mongoose = require('mongoose');

const freeConsultationFormSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'must have full name '],
    },
    phoneNumber: {
      type: String,
      // match: /^(\()?\d{3}(\))?(-|\s)?\d{7}$/,
      minlength: [9, 'Phone Number is In-Valid'],
      maxlength: [15, 'Phone Number is In-Valid'],
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
