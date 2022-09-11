const mongoose = require('mongoose'),
  bcrypt = require('bcrypt');

/**schema for movies to be recieved or sent to database */
let projectSchema = mongoose.Schema({
  service: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  status: {
    title: String,
    description: String
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
  photos: [
    {
      title: String
    }
  ],
  documents: [
    {
      title: String,
      file: String
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
  address: String
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
}

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
}
let Project = mongoose.model('Project', projectSchema);
let User = mongoose.model('User', userSchema);

module.exports.Project = Project;
module.exports.User = User;