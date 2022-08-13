const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config({
  path: path.resolve(__dirname, './.env')
});

let secretEmail = process.env.EMAIL;
let secretPassword = process.env.PASSWORD;

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: secretEmail,
    pass: secretPassword,
  },
});

const sendMail = (name, email, phone, message, callback) => {
  const mailOptions = {
    from: secretEmail,
    to: secretEmail,
    subject: `${name} contacted you from your website`,
    html: `
    <div style="textalign:center;">
    <p>${message}</p>
    <p>email: ${email}</p>
    <p>phone: ${phone}</p>
    </div>`
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, data);
    }
  })
}

module.exports = sendMail;

