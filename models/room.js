// Load required packages
let mongoose = require('mongoose');

// Define our user schema
let RoomSchema = new mongoose.Schema({
  _id: { type: String, index: true },
  name: String,
  image: String,
  description: String,
  maximum: Number,
  createdBy: { type: String, ref: 'User' },
  members: [{ type: String, ref: 'User' }]
});

// Export the Mongoose model
module.exports = mongoose.model('Room', RoomSchema);