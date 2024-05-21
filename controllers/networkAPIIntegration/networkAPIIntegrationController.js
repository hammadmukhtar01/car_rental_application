// const NetworkAPIIntegration = require('../../models/networkAPIIntegrationModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const axios = require('axios').default;

exports.createNetworkPayInvoice = catchAsync(async (req, res, next) => {
  try {
    console.log('333');
    const accessTokenFromNetworkAPI = await getNetworkPaytAccessToken();

    console.log(
      '\n accessTokenFromNetworkAPI is --- ',
      accessTokenFromNetworkAPI
    );

    const {
      firstName,
      lastName,
      email,
      transactionType,
      emailSubject,
      invoiceExpiryDate,
      redirectUrl,
      paymentAttempts,
      items,
      total,
      message,
    } = req.body;

    console.log('Received body-------:', req.body);

    const postCreateInvoiceData = {
      firstName,
      lastName,
      email,
      transactionType,
      emailSubject,
      invoiceExpiryDate,
      redirectUrl,
      paymentAttempts,
      items: items.map((item) => ({
        description: item.description,
        totalPrice: {
          currencyCode: item.totalPrice.currencyCode,
          value: item.totalPrice.value,
        },
        quantity: item.quantity,
      })),
      total: {
        currencyCode: total.currencyCode,
        value: total.value,
      },
      message,
    };
    console.log(
      'postCreateInvoiceData postCreateInvoiceData ------- ',
      postCreateInvoiceData
    );

    console.log(
      `https://api-gateway.ngenius-payments.com/invoices/outlets/${process.env.NETWORK_OUTLET_REF_KEY}/invoice`
    );

    const createInvoiceResponse = await axios({
      method: 'post',
      url: `https://api-gateway.ngenius-payments.com/invoices/outlets/${process.env.NETWORK_OUTLET_REF_KEY}/invoice`,
      headers: {
        authorization: `Bearer ${accessTokenFromNetworkAPI}`,
        'Content-Type': 'application/vnd.ni-invoice.v1+json',
        // accept: 'application/vnd.ni-invoice.v1+json',
      },
      data: postCreateInvoiceData,
    });

    res.status(200).json({
      status: 'success',
      paymentInvoice:
        createInvoiceResponse.data || `No createInvoice Data Found`,
    });
  } catch (error) {
    console.error(error);
    res.status(422).send(error.response.data);

    return next(new AppError('Error while creating createInvoice Data', error));
  }
});

async function getNetworkPaytAccessToken() {
  try {
    console.log(
      `1----authorization: Basic ${process.env.NETWORK_BASIC_AUTH_VALUE},`
    );
    const response = await axios({
      method: 'post',
      url: 'https://api-gateway.ngenius-payments.com/identity/auth/access-token',
      headers: {
        authorization: `Basic ${process.env.NETWORK_BASIC_AUTH_VALUE}`,
        accept: 'application/vnd.ni-identity.v1+json',
        'Content-Type': 'application/vnd.ni-identity.v1+json',
      },
    });
    const access_token_Value = response.data.access_token;
    console.log('access token value is : ', access_token_Value);
    return access_token_Value;
  } catch (error) {
    console.error('Error retrieving access token:', error);
    next(new AppError('Failed to retrieve access token', 500));
  }
}
