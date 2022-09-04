const jwtSecret = 'your_jwt_secret';
//This has to be the same key used in the JWTStrategy in passport.js
const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); //Your local passport file

/**
 * Endpoint /login is located here for registering a user. 
 * When user provides a valid username and password, 
 * then the generated JWT token is attached to response.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username, //This is the username you're encoding in the JWT
    expiresIn: '7d', //This specifies that the token will expire in 7 days
    algorithm: 'HS256' //This is the algorithm used to "sign" or encode the values of the JWT
  });
}

//Authenticate username!
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'user does not exist, try something else',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token }); //res.json({ user: user, token: token })
      });
    })(req, res);
  });
}

