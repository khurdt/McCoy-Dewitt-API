const express = require('express'),
    cors = require('cors'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    passport = require('passport'),
    path = require('path'),
    bodyParser = require('body-parser'),
    sendEmail = require('./mail'),
    getToken = require('./mail');

const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, './.env')
});

const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2

const clientId = process.env.CLIENT_ID,
    clientSecret = process.env.CLIENT_SECRET,
    redirectUri = process.env.REDIRECT_URIS,
    refreshToken = process.env.REFRESH_TOKEN

const oAuth2Client = new OAuth2(clientId, clientSecret, redirectUri)
oAuth2Client.setCredentials({ refresh_token: refreshToken });

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));

// let allowedOrigins = [
//     'https://www.mccoydewitt.com',
//     'http://localhost:3000'
// ];

// //implementing limits using CORS
// app.use(cors({
//     origin: (origin, callback) => {
//         if (!origin) return callback(null, true);
//         if (allowedOrigins.indexOf(origin) === -1) {
//             //If a specific origin isn't found on the list of allowed origins
//             let message = 'The CORS policy for this application does not allow access from origin ' + origin;
//             return callback(new Error(message), false);
//         }
//         return callback(null, true);
//     }
// }));

app.use(methodOverride());

app.use(morgan('common'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/contact', (req, res, callback) => {
    const { name, email, phone, message } = req.body;

    accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL,
            clientId: clientId,
            clientSecret: clientSecret,
            refreshToken: refreshToken,
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

    try {
        await transport.sendMail(mailOptions)
    } catch (error) {
        res.json('problem at transport.sendMail', error);
    }

    callback(null, {
        statusCode: 200,
        body: JSON.stringify(),
        isBase64Encoded: false,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Origin': 'http://localhost:3000',
        },
    });

});

// getToken().then(result => {
//     sendEmail(name, email, phone, message, JSON.parse(result.body)).then(result => {
//         res.json('Email sent successfully', result)
//     }).catch(error => res.json('failed to send email with token', {
//         statusCode: 500,
//         headers: {
//             'Access-Control-Allow-Origin': '*',
//         },
//         body: JSON.stringify(error),
//     }));
// }).catch((error) => {
//     res.json('failed to get token', error);
// });

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
    next();
});

const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
    console.log('listening on Port ' + port);
})
