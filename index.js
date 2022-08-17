const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    mongoose = require('mongoose'),
    Models = require('./models.js'),
    passport = require('passport'),
    path = require('path'),
    cors = require('cors');

// const { check, validationResult } = require('express-validator');
/**
 * these are the schema models of movies and users imported from models.js
 */
// const Movies = Models.Movie;
// const Users = Models.User;
/**express will be used to create server endpoints and implement middleware */
const app = express();
app.use(cors());


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
    extended: true
}));

app.use(bodyParser.json());
//this must come after the middleware bodyParser urlencoded

/**
 * Cors is implemented here and in order to allow mulitple domains, the callback function is used. 
 * The domains listed are for locally hosted clients, the online React client, or the online Angular client.
 */
// let allowedOrigins = [
//     'https://kh-movie-app.herokuapp.com',
//     'http://127.0.0.1:8080',
//     'http://localhost:1234',
//     'https://kh-cinema-app.netlify.app',
//     'http://localhost:3000',
//     'https://khurdt.github.io/movie-app-angular-client',
//     'https://khurdt.github.io'
// ];

// //implementing limits using CORS
// app.use(cors({
//     origin: (origin, callback) => {
//         //if there is no incoming origin then remain available
//         if (!origin) return callback(null, true);
//         if (allowedOrigins.indexOf(origin) === -1) {
//             //If the incoming origin isn't found on the list of allowed origins
//             let message = 'The CORS policy for this application does not allow access from origin ' + origin;
//             return callback(new Error(message), false);
//         }
//         return callback(null, true);
//     }
// }));

require('./auth')(app); //(app) at the end allows express to be used in auth.js

/**passport is a middleware used to authenticate jwt and to see if it has expired or not.*/
require('./passport');

/**The method-override middleware lets us use HTTP verbs like PUT and DELETE with clients that don’t support it.*/
app.use(methodOverride());

/**morgan is a middleware used to create a formatted timestamp for each endpoint request.*/
app.use(morgan('common'));

/** */
app.use(express.static('public'));

//--------READ or GET---------------------------------------------------

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * gets static documentation
 * @returns documentation html
*/
app.get('/documentation.html', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//--------CREATE or POST--------------------------------------------------------------------------

/**
 * adds a movie id to favorite movie array in database
 * @param username
 * @param movieID
*/
app.post('/contact', (req, res) => {
    const { name, email, phone, message } = req.body;
    res.json(name, email, phone, message);
});

//--------PUT or UPDATE--------------------------------------------------------------------------------


//--------DELETE-----------------------------------------------------------


//--------Error Handler----------------------------------------------------

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
    next();
});

//--------END--------------------------------------------------------------

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});