const express = require('express'),
    cors = require('cors'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    passport = require('passport'),
    path = require('path'),
    bodyParser = require('body-parser'),
    sendEmail = require('./mail'),
    getToken = require('./mail');

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

let allowedOrigins = [
    'http://localhost:3000',
    'https://www.mccoydewitt.com',
    'https://developers.google.com'
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/contact', (req, res) => {
    const { name, email, phone, message } = req.body;
    getToken().then(result => {
        sendEmail(name, email, phone, message, JSON.parse(result.body)).then(result => {
            res.json('Email sent successfully', {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify(result),
            })
        }).catch(error => res.json('failed to send email with token', {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(error),
        }));
    }).catch((error) => {
        res.json('failed to get token', error);
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
    next();
});

const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
    console.log('listening on Port ' + port);
})
