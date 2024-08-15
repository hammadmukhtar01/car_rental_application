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
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
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

        htmlContent = htmlContent.replace('{{fName}}', options.fName);
        htmlContent = htmlContent.replace('{{lName}}', options.lName);

        let dynamicContent = '';

        if (options.type === 'signup') {
          dynamicContent = `
             <div class="sign-up-email">
                <p style="font-size: 16px">
                  Login password is: <b>${options.password}</b>
                </p>
                <p style="text-align: left">
                  <b>Note:</b> Password is the combination of your First Name
                  and last 4 digits of your Phone Number. You can change your
                  password anytime after log In at <b><a href="https://www.milelecarrental.com">Milele Car Rental</a></b>.
                </p>
              </div>
          `;
        } else if (options.type === 'contactus') {
          dynamicContent = `
            <div class="contact-us-form-email">
                <h3 style="font-size: 18px">
                  We have received your inquiry. You will be contacted by our
                  experts soon!
                </h3>
              </div> 
          `;
        }

        htmlContent = htmlContent.replace('{{dynamicContent}}', dynamicContent);

        mailOptions = {
          from: `Milele Car Rental <${process.env.EMAIL_USERNAME}>`,
          to: options.email,
          subject: options.subject,
          text: options.message,
          html: htmlContent,
          headers: {
            'List-Unsubscribe':
              '<mailto:unsubscribe@milelecarrental.com?subject=unsubscribe>',
          },
        };
      } else {
        mailOptions = {
          from: `Milele Car Rental <${process.env.EMAIL_USERNAME}>`,
          to: options.email,
          subject: options.subject,
          text: options.message,
          headers: {
            'List-Unsubscribe':
              '<mailto:unsubscribe@milelecarrental.com?subject=unsubscribe>',
          },
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
