const mongoose = require('mongoose'),
  bcrypt = require('bcrypt');

/**schema for movies to be recieved or sent to database */
let projectSchema = mongoose.Schema({
  createdAt: { type: Date, required: true },
  service: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  status: {
    title: String,
    description: String,
    color: String
  },
  users: [{
    type: String
  }],
  insuranceClaim: {
    using: Boolean,
    claimNumber: Number,
    dateOfDamage: Date,
    dateOfInspection: Date
  },
  files: [
    {
      name: String
    }
  ],
  comments: [
    {
      textID: Number,
      user: String,
      text: String
    }
  ]
});

/**schema for users to be recieved or sent to database */
let userSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  company: String,
  address: String,
  color: String
});

let passwordResetSchema = mongoose.Schema({
  userId: String,
  resetString: String,
  createdAt: Date,
  expiresAt: Date
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
}

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
}

passwordResetSchema.statics.hashResetString = function (resetString) {
  return bcrypt.hashSync(resetString, 10);
}

passwordResetSchema.methods.validateResetString = function (resetString) {
  return bcrypt.compareSync(resetString, this.resetString);
}

let Project = mongoose.model('Project', projectSchema);
let User = mongoose.model('User', userSchema);
let PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports.Project = Project;
module.exports.User = User;
module.exports.PasswordReset = PasswordReset;