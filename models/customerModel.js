const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const customerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [3, 'must have greater or equal to 3 length'],
      maxlength: [50, 'must have less or equal to 50 length'],
      required: [true, 'Must have a name'],
    },
    email: {
      type: String,
      required: [true, 'Must have a email'],
      unique: [true, 'Email must not be used before'],
      lowercase: true,
      validate: [validator.isEmail, 'Email is In-Valid'],
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (value) {
          return validator.isMobilePhone(value, 'any', { strictMode: false });
        },
        message: 'Phone Number is In-Valid',
      },
      minlength: [9, 'Phone Number is In-Valid'],
      required: [true, 'Phone Number is missing.'],
      unique: [true, 'Phone number must not be used before'],
    },
    password: {
      type: String,
      required: [true, 'Must have a password'],
      minlength: [7, 'Minimum password length must be 7'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Must have a confirm password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not same',
      },
    },

    creditPoints: {
      type: Number,
      default: 0,
    },

    passwordChangedAt: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    emailConfirmToken: String,

    confirmEmailToken: String,

    role: {
      type: String,
      enum: ['customer'],
      default: 'customer',
    },
    passResetToken: String,
    passTokenExpire: Date,
    active: {
      type: Boolean,
      default: true,
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

customerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

customerSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

customerSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

customerSchema.methods.correctPassword = async function (
  candPassword,
  userPassword
) {
  return await bcrypt.compare(candPassword, userPassword);
};

customerSchema.methods.changedPasswordAfter = function (JWTTimesstamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimeStamp, JWTTimesstamp)
    return JWTTimesstamp < changedTimeStamp;
  }
};

customerSchema.methods.passwordResetToken = function () {
  const ResetToken = crypto.randomBytes(32).toString('hex');

  this.passResetToken = crypto
    .createHash('sha256')
    .update(ResetToken)
    .digest('hex');

  // console.log({ ResetToken }, this.passResetToken);

  this.passTokenExpire = Date.now() + 10 * 60 * 1000;

  return ResetToken;
};

customerSchema.methods.emailResetToken = function () {
  const emailConfirm = crypto.randomBytes(32).toString('hex');

  this.confirmEmailToken = crypto
    .createHash('sha256')
    .update(emailConfirm)
    .digest('hex');

  return emailConfirm;
};

customerSchema.methods.updateCreditPoints = function (totalPaidAmount) {
  const creditPointsToAdd = Math.floor(totalPaidAmount);

  return this.constructor.updateOne(
    { _id: this._id },
    { $inc: { creditPoints: creditPointsToAdd } }
  );
};

const Customer = mongoose.model('customer', customerSchema);

module.exports = Customer;
