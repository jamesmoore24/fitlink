const mongoose = require("mongoose");

//define a message schema for the database
const StarSchema = new mongoose.Schema({
  userId: String,
  postId: String,
});

// compile model from schema
module.exports = mongoose.model("star", StarSchema);
