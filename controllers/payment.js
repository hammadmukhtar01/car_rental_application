const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AdditionalBooking = require('../models/additionalBookingDetailsModel');

// Create a payment method using a credit card
exports.payment = async (req, res, next) => {
  let paymentIntent;
  const additionalBooking = await AdditionalBooking.findById(
    req.body.additionalBookingDetailsId
  );

  if (!additionalBooking) {
    return next(new AppError('Additional Booking not found', 404));
  }

  const amount = additionalBooking.totalPrice * 78 ; // in dollars
  console.log("Additonal booking total amount in payment is : ", additionalBooking.totalPrice)
  
  if (amount < 30) {
    return res.status(400).send({ error: 'Amount too small' });
  }

  try {
    // Create payment method
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: req.body.cardNumber,
        exp_month: req.body.expMonth,
        exp_year: req.body.expYear,
        cvc: req.body.cvc,
      },
    });

    // Create payment intent
    paymentIntent = await stripe.paymentIntents.create({
      payment_method: paymentMethod.id,
      amount,
      currency: 'pkr',
      confirmation_method: 'manual',
      confirm: true,
    });

    // Payment succeeded
    console.log('Payment succeeded:', paymentIntent);
    req.paid = true;
    req.body.payementId = paymentIntent.id;
    next();
  } catch (error) {
    // Payment failed
    console.log('Payment failed:', error);
    return res.status(500).send({ error: 'Payment failed' });
  }
};
