const mongoose = require("mongoose");

//define a message schema for the database
const ExerciseSchema = new mongoose.Schema({
  type: String,
  parent: String, //what workout it is underneath
  sets: [
    {
      reps: Number,
      weight: Number,
      rpe: Number,
    },
  ],
});

// compile model from schema
module.exports = mongoose.model("exercise", ExerciseSchema);