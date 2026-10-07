const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
});

const postModel = mongoose.model("post", postSchema);

module.exports = postModel;
