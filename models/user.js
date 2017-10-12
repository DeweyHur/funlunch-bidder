// Load required packages
let mongoose = require('mongoose');

// Define our user schema
let UserSchema = new mongoose.Schema({
  _id: String,
  gid: String,
  name: String,
  accessToken: String
});

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);