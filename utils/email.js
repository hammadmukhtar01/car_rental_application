const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendMail = async (options) => {
  return new Promise(async (resolve, reject) => {
    try {
      // create transporter
      const transporter = nodemailer.createTransport({
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

      let mailOptions;

      if (options.isHtml) {
        const templatePath = path.join(
          __dirname,
          '../templates/emailTemplate.html'
        );
        let htmlContent = fs.readFileSync(templatePath, 'utf8');

        htmlContent = htmlContent.replace('{{fname}}', options.fname);
        htmlContent = htmlContent.replace('{{lname}}', options.lname);

        mailOptions = {
          from: 'Milele Car Rental <jeehammad840@gmail.com>',
          to: options.email,
          subject: options.subject,
          text: options.message,
          html: htmlContent,
        };
      } else {
        mailOptions = {
          from: 'Milele Car Rental <jeehammad840@gmail.com>',
          to: options.email,
          subject: options.subject,
          text: options.message,
        };
      }

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
