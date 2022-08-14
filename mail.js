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

<<<<<<< HEAD
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

=======
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const CLIENT_ID = '728614009915-2apnsbdon3ajhpd82mg83u79urderhvb.apps.googleusercontent.com'
const CLIENT_SECRET = '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'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = '1//04eENtjfpvVRPCgYIARAAGAQSNwF-L9IrQEowZHqcbbxqqkduut_7sbeI1xWMMDuD5qV1UaHOtCbx_Yz9VJh7aF1PY-yDjUZq0oc'

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

async function sendMail() {
  try {
    const accessToken = await oAuth2Client.getAccessToken()

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.WEBSITE_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken
      }
    })
    const mailOptions = {
      from: process.env.WEBSITE_EMAIL,
      to: process.env.WEBSITE_EMAIL,
      subject: `${name} contacted you from your website`,
      html: `
      <div style="textalign:center;">
      <p>${message}</p>
      <p>email: ${email}</p>
      <p>phone: ${phone}</p>
      </div>`
    };

    const result = transport.sendMail(mailOptions);
    return result
  } catch (error) {
    return error
  }
}

sendMail().then(result => console.log('Email sent...'), result)
  .catch(error => console.log(error.message));
>>>>>>> 7d7091c (added OAUTH GMAIL SERVICE)
