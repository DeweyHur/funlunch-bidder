// Load required packages
let mongoose = require('mongoose');

// Define our user schema
let RoomSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  maximum: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Export the Mongoose model
module.exports = mongoose.model('Room', RoomSchema);