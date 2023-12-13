const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  return new Promise(async (resolve, reject) => {
    try {
      // create transporter
      const transporter = nodemailer.createTransport({
        // host: process.env.EMAIL_HOSTNAME,
        // port: process.env.EMAIL_PORT,
        // auth: {
        //   user: process.env.EMAIL_USERNAME,
        //   pass: process.env.EMAIL_PASSWORD,
        // },
        service: 'gmail',
        secure: false,
        auth: {
          user: 'jeehammad840@gmail.com',
          pass: 'nsqetmujpktomnlv',
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // mail options
      const mailOptions = {
        from: 'Milele <jeehammad840@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
      };

      // send the mail
      const info = await transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);

      resolve(info);
    } catch (error) {
      console.error('Error sending email:', error);
      reject(error);
    }
  });
};

module.exports = sendMail;
