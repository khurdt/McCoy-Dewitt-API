const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2

const clientId = CLIENT_ID,
  clientSecret = CLIENT_SECRET,
  redirectUri = REDIRECT_URIS,
  refreshToken = REFRESH_TOKEN,
  clientEmail = EMAIL

const oAuth2Client = new OAuth2(clientId, clientSecret, redirectUri)
oAuth2Client.setCredentials({ refresh_token: refreshToken });

async function sendEmail(name, email, phone, message) {

  accessToken = await oAuth2Client.getAccessToken();

  try {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: clientEmail,
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
        accessToken: accessToken
      }
    });

    const mailOptions = {
      from: clientEmail,
      to: clientEmail,
      subject: `${name} contacted you from your website`,
      html: `
      <div style="textAlign:left;marginLeft:30px">
      <p>${message}</p>
      <p>email: ${email}</p>
      <p>phone: ${phone}</p>
      </div>`
    };

    let result = await transport.sendMail(mailOptions);

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

// accessToken = await new Promise((resolve, reject) => {

//   oAuth2Client.getAccessToken((err, token) => {
//     if (err) {
//       return reject(err);
//     }
//     return resolve(token);
//   });
// })
//   .then((token) => {
//     // Respond with OAuth token 
//     return {
//       statusCode: 200,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//       },
//       body: JSON.stringify(token),
//     };
//   })
//   .catch((err) => {
//     // Handle error
//     console.error(err);
//     return {
//       statusCode: 500,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//       },
//       body: JSON.stringify(err),
//     };
//   });

module.exports = sendEmail;