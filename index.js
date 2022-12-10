const express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    cors = require('cors'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    sendEmail = require('./mail'),
    sendPasswordReset = require('./mail'),
    mongoose = require('mongoose'),
    Models = require('./models.js'),
    passport = require('passport'),
    cloudinary = require('cloudinary'),
    { v4: uuidv4 } = require('uuid');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const { check, validationResult } = require('express-validator');

const Projects = Models.Project;
const Users = Models.User;
const PasswordReset = Models.PasswordReset;

mongoose.connect(process.env.MONGO_ATLAS, { useNewUrlParser: true, useUnifiedTopology: true });

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

//------MiddleWare---------------------------------------------------------------------------------------------------

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
let allowedOrigins = [
    'https://www.mccoydewitt.com',
    'http://localhost:3000'
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

require('./auth')(app); //(app) at the end allows express to be used in auth.js

/**passport is a middleware used to authenticate jwt and to see if it has expired or not.*/
require('./passport');

/**The method-override middleware lets us use HTTP verbs like PUT and DELETE with clients that don’t support it.*/
app.use(methodOverride());

/**morgan is a middleware used to create a formatted timestamp for each endpoint request.*/
app.use(morgan('common'));

//--------READ or GET---------------------------------------------------

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/projects', passport.authenticate('jwt', { session: false }), function (req, res) {
    Projects.find().then((projects) => {
        res.status(200).json(projects);
    })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        })
});

app.get('/oneProject/:projectId', passport.authenticate('jwt', { session: false }), function (req, res) {
    Projects.findOne({ _id: req.params.projectId }).then((project) => {
        res.status(200).json(project);
    })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        })
});

app.get('/projects/:username', passport.authenticate('jwt', { session: false }), function (req, res) {
    Projects.find({ users: req.params.username }).then((projects) => {
        res.status(200).json(projects);
    })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        })
});

app.get('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ username: req.params.username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        })
});
//--------CREATE or POST--------------------------------------------------------------------------

app.post('/contact', (req, res, callback) => {
    const { name, email, phone, message } = req.body;

    sendEmail(name, email, phone, message).then(result => {
        res.status(200).json(result)
    }).catch(error => res.status(500).json(error));
});

app.post('/password-reset/:email', (req, res) => {
    Users.findOne({ email: req.params.email })
        .then((user) => {
            if (user._id) {
                const resetString = (uuidv4() + user._id);
                let hashedString = PasswordReset.hashResetString(resetString);
                PasswordReset.deleteMany({ userId: user._id }).then((result) => {
                    PasswordReset.create({
                        userId: user._id,
                        resetString: hashedString,
                        createdAt: new Date(),
                        expiresAt: new Date() + 3600000
                    }).then(() => {
                        sendPasswordReset(req.params.email, hashedString, user._id).then(result => {
                            res.status(200).json(result)
                        }).catch((error) => {
                            res.status(500).json({ message: 'failed to send email', error: error });
                        });
                    }).catch((error) => {
                        res.status(500).json({ message: 'failed to create new password reset', error: error });
                    });
                }).catch((error) => {
                    res.status(500).json({ message: 'failed to delete old password reset', error: error });
                })
            } else {
                res.status(500).json({ message: 'account was not found' });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});


/**
 * adds or registers a user to users collection
 * checks username, password, email format using express-validator
 * hashes provided password before storing
 * if no errors, it will proceed to store user info in database
 * @param username
 * @param password
 * @param email
 * @param birthday
 * @returns one user 
 */
app.post('/users',
    [
        check('firstName', 'username contains non non-alphanumeric characters - not allowed').isAlphanumeric(),
        check('lastName', 'username contains non non-alphanumeric characters - not allowed').isAlphanumeric(),
        check('username', 'username is required').isLength({ min: 5 }),
        check('username', 'username contains non non-alphanumeric characters - not allowed').isAlphanumeric(),
        check('password', 'password is required').not().isEmpty(),
        check('email', 'email does not appear to be valid').isEmail()
    ], (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let hashedPassword = Users.hashPassword(req.body.password);
        Users.findOne({ username: req.body.username })
            .then((user) => {
                if (user) {
                    return res.status(400).send(req.body.username + ' already exists');
                } else {
                    Users.create({
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        username: req.body.username,
                        password: hashedPassword,
                        email: req.body.email,
                        phone: req.body.phone,
                        company: req.body.company,
                        address: req.body.address
                    })
                        .then((user) => {
                            res.status(201).json(user)
                        })
                        .catch((error) => {
                            console.error(error);
                            res.status(500).send('Error: ' + error);
                        })
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
    });

app.post('/projects', passport.authenticate('jwt', { session: false }), (req, res) => {
    Projects.create({
        service: req.body.service,
        description: req.body.description,
        location: req.body.location,
        insuranceClaim: req.body.insuranceClaim,
        users: req.body.users,
        status: req.body.status
    }).then((project) => {
        res.status(201).json(project)
    })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        })
});

app.post('/users/:username/projects/:projectId', passport.authenticate('jwt', { session: false }), (req, res) => {
    Projects.findOneAndUpdate({ _id: req.params.projectId },
        {
            $push: { users: req.params.username }
        },
        { new: true }, //This line makes sure that the updated document is returned
        (err, updatedProject) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedProject);
            }
        });
});

/**
* adds username to project document
* @param username
* @param movieID
*/
app.post('/files/:fileName/projects/:projectId', passport.authenticate('jwt', { session: false }), (req, res) => {
    Projects.findOneAndUpdate({ _id: req.params.projectId },
        {
            $push: { files: { name: req.params.fileName } }
        },
        { new: true }, //This line makes sure that the updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});

//--------PUT or UPDATE--------------------------------------------------------------------------------

app.put('/projects/:projectId', passport.authenticate('jwt', { session: false }), (req, res) => {
    Projects.findOneAndUpdate({ _id: req.params.projectId },
        {
            $set:
            {
                description: req.body.description,
                location: req.body.location,
                insuranceClaim: req.body.insuranceClaim,
                status: req.body.status,
                users: req.body.users,
            }
        },
        { new: true },
        (err, updatedProject) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedProject);
            }
        });
});

app.put('/password-reset', (req, res) => {
    const objectId = mongoose.Types.ObjectId(req.body.id);

    PasswordReset.findOne({ userId: req.body.id }).then((user) => {
        if (user) {
            if (user.validateResetString(req.body.resetString)) {
                let hashedPassword = Users.hashPassword(req.body.password);
                Users.findOneAndUpdate({ _id: objectId },
                    {
                        $set:
                        {
                            password: hashedPassword
                        }
                    },
                    { new: true },// This line makes sure that the updated document is returned
                    (err, updatedUser) => {
                        if (err) {
                            console.error(err);
                            res.status(500).send({ message: 'failed to update', err: err });
                        } else {
                            res.status(200).json(updatedUser);
                        }
                    });
            } else {
                res.status(500).json({ message: `reset string is not valid` });
            }
        } else {
            res.status(500).json({ message: `did not find correct id` });
        }
    }).catch((error) => {
        res.status(500).json(error);
    })
});


/**
 * changes user's info and new password is hashed
 * checks username, password, email format using express-validator
 * hashes provided password before storing
 * if no errors, it will proceed to store user info in database 
 * @param username
 * @param password
 * @param email
 * @param birthday
 * @returns one user 
 */
app.put('/users/:username',
    [
        passport.authenticate('jwt', { session: false }),
        check('username', 'username is required').isLength({ min: 5 }),
        check('username', 'username contains non non-alphanumeric characters - not allowed').isAlphanumeric(),
        check('email', 'email does not appear to be valid').isEmail()
    ], (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        Users.findOneAndUpdate({ username: req.params.username },
            {
                $set:
                {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    username: req.body.username,
                    email: req.body.email,
                    phone: req.body.phone,
                    company: req.body.company,
                    address: req.body.address,
                    color: req.body.color
                }
            },
            { new: true },// This line makes sure that the updated document is returned
            (err, updatedUser) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error: ' + err);
                } else {
                    res.json(updatedUser);
                }
            });
    });

//--------DELETE-----------------------------------------------------------
/** 
 * deletes a project from list
 * @param username
 * @param movieID
*/
app.delete('/files/:fileName/projects/:projectId', passport.authenticate('jwt', { session: false }), async (req, res) => {

    try {
        await cloudinary.v2.uploader.destroy(req.params.fileName);

        const removeFile = await Projects.findOneAndUpdate({ _id: req.params.projectId },
            {
                $pull: { files: { name: req.params.fileName } }
            },
            { new: true }); //This line makes sure that the updated document is returned

        res.status(201).json({
            success: true,
            message: 'file deleted'
        })
    } catch (error) {
        console.log(error);
        res.status(500).send('Error: ' + err);
    }

});

app.delete('/users/:username/projects/:projectId', passport.authenticate('jwt', { session: false }), (req, res) => {
    Projects.findOneAndUpdate({ _id: req.params.projectId },
        {
            $pull: { users: req.params.username }
        },
        { new: true }, //This line makes sure that the updated document is returned
        (err, updatedProject) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedProject);
            }
        });
});

app.delete('/projects/:projectId', passport.authenticate('jwt', { session: false }), (req, res) => {
    Projects.findOneAndRemove({ _id: req.params.projectId })
        .then((project) => {
            if (!project) {
                res.status(400).send(req.params.projectId + ' was not found');
            } else {
                res.status(200).send(req.params.projectId + ' was deleted');
            }
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
})

/**
 * deletes user from users collection
 * @param username
 */
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ username: req.params.username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.username + ' was not found');
            } else {
                res.status(200).send(req.params.username + ' was deleted');
            }
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//--------Error Handler----------------------------------------------------

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json('Server broke, caught by Server Error Handler!', err);
    next();
});

//--------END--------------------------------------------------------------

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});