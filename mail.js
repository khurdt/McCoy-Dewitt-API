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

module.exports.sendEmail = async (name, email, phone, message, callback) => {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: secretEmail,
      pass: secretPassword,
    },
  });

  try {
    if (name !== undefined) {
      await transporter.sendMail({
        from: secretEmail, // sender address
        to: secretEmail, // receiver address
        subject: `${name} contacted you from your portfolio website`, // subject line, taken from client request
        html: `<p>${name}</p><p>${phone}</p><p>${email}</p><p>${message}</p>`
      });
    }
  } catch (error) {
    console.log(error);
  }

  callback(null, {
    statusCode: 200,
    body: JSON.stringify(responseBody),
    isBase64Encoded: false,
    headers: {
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Origin': 'http://localhost:3000',
    },
  });
}

