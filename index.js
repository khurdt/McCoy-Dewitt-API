const express = require('express'),
    cors = require('cors'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    passport = require('passport'),
    path = require('path'),
    bodyParser = require('body-parser'),
    sendEmail = require('./mail');

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

let allowedOrigins = [
    'http://localhost:3000',
    'https://www.mccoydewitt.com'
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

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/contact', (req, res) => {
    const { name, email, phone, message } = req.body;
    sendEmail(name, email, phone, message).then(result => {
        res.status(200).json('Email sent successfully', result)
    }).catch(error => res.status(500).json('Internal Error', error));
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
