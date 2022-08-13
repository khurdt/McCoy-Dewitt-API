const express = require('express'),
    cors = require('cors'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    passport = require('passport'),
    nodemailer = require('nodemailer'),
    path = require('path'),
    bodyParser = require('body-parser'),
    sendEmail = require('./mail');

require('dotenv').config({
    path: path.resolve(__dirname, './.env')
});

let secretEmail = process.env.EMAIL;
let secretPassword = process.env.PASSWORD;

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

let allowedOrigins = [
    'http://localhost:3000'
];

//implementing limits using CORS
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            //If a specific origin isn't found on the list of allowed origins
            let message = 'The CORS policy for this application does not allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

app.use(methodOverride());

app.use(morgan('common'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/contact', (req, res, callback) => {
    const { name, email, phone, message } = req.body;
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
    // sendMail(name, email, phone, message, function (err, data) {
    //     if (err) {
    //         res.status(500).json({ message: 'Internal Error', err })
    //     } else {
    //         res.status(200).json({ message: 'Email Sent Successfully', data });
    //     }
    // });
});
const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
    console.log('listening on Port ' + port);
})