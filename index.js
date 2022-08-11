const bodyParser = require('body-parser');
const express = require('express'),
    cors = require('cors'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    passport = require('passport'),
    nodemailer = require('nodemailer'),
    path = require('path');

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

app.post('/contact', (req, res) => {

    res.json({
        name: req.body.name,
        email: req.body.email,
        message: req.body.message
    })
    // var transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: 'youremail@gmail.com',
    //         pass: 'yourpassword'
    //     }
    // });

    // var mailOptions = {
    //     from: 'youremail@gmail.com',
    //     to: 'myfriend@yahoo.com',
    //     subject: 'Sending Email using Node.js',
    //     text: 'That was easy!'
    // };

    // transporter.sendMail(mailOptions, function (error, info) {
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         console.log('Email sent: ' + info.response);
    //     }
    // });

    // const transporter = nodemailer.createTransport({
    //     SES: ses
    // });

    // try {
    //     if (name !== undefined) {
    //         await transporter.sendMail({
    //             from: process.env.EMAIL_ID, // sender address
    //             to: process.env.EMAIL_ID, // receiver address
    //             subject: `${name} contacted you from your portfolio website`, // subject line, taken from client request
    //             html: `<p>${name}</p><p>${phone}</p><p>${email}</p><p>${message}</p>`
    //         });
    //     }
    // } catch (error) {
    //     console.log(error);
    // }

    // callback(null, {
    //     statusCode: 200,
    //     body: JSON.stringify(responseBody),
    //     isBase64Encoded: false,
    //     headers: {
    //         'Access-Control-Allow-Headers': '*',
    //         'Access-Control-Allow-Methods': 'POST',
    //         'Access-Control-Allow-Origin': 'https://khurdt.github.io',
    //     },
    // });
})

const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
    console.log('listening on Port ' + port);
})