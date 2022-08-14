const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, './.env')
});

const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const CLIENT_ID = '728614009915-2apnsbdon3ajhpd82mg83u79urderhvb.apps.googleusercontent.com'
const CLIENT_SECRET = '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'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = '1//04eENtjfpvVRPCgYIARAAGAQSNwF-L9IrQEowZHqcbbxqqkduut_7sbeI1xWMMDuD5qV1UaHOtCbx_Yz9VJh7aF1PY-yDjUZq0oc'

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

async function sendEmail(name, email, phone, message, callback) {
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
      <div style="textAlign:left;marginLeft:30px">
      <p>${message}</p>
      <p>email: ${email}</p>
      <p>phone: ${phone}</p>
      </div>`
    };

    const result = await transport.sendMail(mailOptions);

    callback(null, {
      statusCode: 200,
      body: JSON.stringify(result),
      isBase64Encoded: false,
      headers: {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Origin': 'http://localhost:3000',
      },
    });
  } catch (error) {
    callback(error, null)
  }
}

module.exports = sendEmail
