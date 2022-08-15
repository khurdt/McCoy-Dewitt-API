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
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function getToken() {
  accessToken = await new Promise((resolve, reject) => {

    oAuth2Client.getAccessToken((err, token) => {
      if (err) {
        return reject(err);
      }
      return resolve(token);
    });
  })
    .then((token) => {
      // Respond with OAuth token 
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(token),
      };
    })
    .catch((err) => {
      // Handle error
      console.error(err);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(err),
      };
    });

  return accessToken;
}

async function sendEmail(name, email, phone, message) {

  accessToken = await new Promise((resolve, reject) => {

    oAuth2Client.getAccessToken((err, token) => {
      if (err) {
        return reject(err);
      }
      return resolve(token);
    });
  })
    .then((token) => {
      // Respond with OAuth token 
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(token),
      };
    })
    .catch((err) => {
      // Handle error
      console.error(err);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(err),
      };
    });

  try {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken
      }
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: `${name} contacted you from your website`,
      html: `
      <div style="textAlign:left;marginLeft:30px">
      <p>${message}</p>
      <p>email: ${email}</p>
      <p>phone: ${phone}</p>
      </div>`
    };

    result = await transport.sendMail(mailOptions);

    return result;

  } catch (error) {

    return error;
  }
}

// sendEmail('Kevin', 'Hurdt', '@', '123', 'this is a test').then(result => {
//   console.log('email sent', result)
// }).catch((error) => {
//   console.log('something went wrong', error);
// });

// getToken().then(result => {
//   console.log('got token', result)
// }).catch((error) => {
//   console.log('something went wrong', error);
// });

// getToken().then(result => {
//   sendEmail('Kevin', 'Hurdt', '@', '123', 'this is a test', JSON.parse(result.body)).then(result => {
//     console.log('Email sent successfully', {
//       statusCode: 200,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//       },
//       body: JSON.stringify(result),
//     })
//   }).catch(error => console.log('failed to send email with token', {
//     statusCode: 500,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//     },
//     body: JSON.stringify(error),
//   }));
// }).catch((error) => {
//   console.log('failed to get token', error);
// });

module.exports = sendEmail;
module.exports = getToken;