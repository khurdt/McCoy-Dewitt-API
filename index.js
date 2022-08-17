const express = require('express'),
    cors = require('cors'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    passport = require('passport'),
    path = require('path'),
    bodyParser = require('body-parser'),
    sendEmail = require('./mail'),
    getToken = require('./mail'),
    returnBody = require('./mail');

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

let allowedOrigins = [
    'https://kh-movie-app.herokuapp.com',
    'http://127.0.0.1:8080',
    'http://localhost:1234',
    'https://kh-cinema-app.netlify.app',
    'http://localhost:3000',
    'https://khurdt.github.io/movie-app-angular-client',
    'https://khurdt.github.io'
];

//implementing limits using CORS
app.use(cors({
    origin: (origin, callback) => {
        //if there is no incoming origin then remain available
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            //If the incoming origin isn't found on the list of allowed origins
            let message = 'The CORS policy for this application does not allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

app.use(methodOverride());

app.use(morgan('common'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/contact', (req, res) => {
    const { name, email, phone, message } = req.body;

    res.json(name, email, phone, message);

    // responseBody = {
    //     name: name,
    //     email: email,
    //     phone: phone,
    //     message: message
    // }

    // res.json(responseBody);

    // returnBody(name, email, phone, message, function (err, body) {
    //     if (err) {
    //         res.json('error', err);
    //     } else {
    //         res.json('success', body)
    //     }
    // })

});


//     sendEmail(name, email, phone, message).then(result => {
//         res.json('Email sent successfully', result)
//     }).catch(error => res.json('failed to send email with token', {
//         statusCode: 500,
//         headers: {
//             'Access-Control-Allow-Origin': '*',
//         },
//         body: JSON.stringify(error),
//     });


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
    next();
});

const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
    console.log('listening on Port ' + port);
})
