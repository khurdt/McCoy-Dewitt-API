const express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    cors = require('cors'),
    sendEmail = require('./mail');

// const { check, validationResult } = require('express-validator');
/**
 * these are the schema models of movies and users imported from models.js
 */
// const Movies = Models.Movie;
// const Users = Models.User;
/**express will be used to create server endpoints and implement middleware */
const app = express();

/**
 * this is how mongoose connects to mongo database server
 */
// mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.connect('mongodb://localhost:27017/movieDB', {useNewUrlParser: true, useUnifiedTopology: true});

//------MiddleWare---------------------------------------------

/**
 * bodyParser middleware will automatically stringify request and response as they are sent
 * between client, server, and database and then parse them as they are recieved.
 */
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());
//this must come after the middleware bodyParser urlencoded

/**
 * Cors is implemented here and in order to allow mulitple domains, the callback function is used. 
 * The domains listed are for locally hosted clients, the online React client, or the online Angular client.
 */
let allowedOrigins = [
    'https://www.mccoydewitt.com',
    'http://localhost:3000',
    'http://127.0.0.1:8080'
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

//--------READ or GET---------------------------------------------------

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

//--------CREATE or POST--------------------------------------------------------------------------

app.post('/contact', (req, res) => {
    sendEmail(
        req.body.name,
        req.body.email,
        req.body.phone,
        req.body.message
    ).then(result => {
        res.json('Email sent successfully', result)
    }).catch(error => console.log('failed to send email with token', error));
})

//--------PUT or UPDATE--------------------------------------------------------------------------------


//--------DELETE-----------------------------------------------------------


//--------Error Handler----------------------------------------------------

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json('Something broke!', err);
    next();
});

//--------END--------------------------------------------------------------

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});