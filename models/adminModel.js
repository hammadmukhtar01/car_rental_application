const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const adminSchema = mongoose.Schema(
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
      validate: [validator.isEmail, 'Enter valid email'],
    },
    password: {
      type: String,
      required: [true, 'Must have a password'],
      minlength: [7, 'must have > 7 length'],
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
    passwordChangedAt: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
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

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

adminSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

adminSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

adminSchema.methods.correctPassword = async function (
  candPassword,
  userPassword
) {
  return await bcrypt.compare(candPassword, userPassword);
};

adminSchema.methods.changedPasswordAfter = function (JWTTimesstamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimeStamp, JWTTimesstamp)
    return JWTTimesstamp < changedTimeStamp;
  }
};

adminSchema.methods.passwordResetToken = function () {
  const ResetToken = crypto.randomBytes(32).toString('hex');

  this.passResetToken = crypto
    .createHash('sha256')
    .update(ResetToken)
    .digest('hex');

  // console.log({ ResetToken }, this.passResetToken);

  this.passTokenExpire = Date.now() + 10 * 60 * 1000;

  return ResetToken;
};

adminSchema.methods.emailResetToken = function () {
  const emailConfirm = crypto.randomBytes(32).toString('hex');

  this.confirmEmailToken = crypto
    .createHash('sha256')
    .update(emailConfirm)
    .digest('hex');

  return emailConfirm;
};

const Admin = mongoose.model('admin', adminSchema);

module.exports = Admin;
