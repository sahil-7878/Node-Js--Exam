const mongoose = require("mongoose");

// Comment schema - stores comment text, who wrote it, and which article it belongs to
const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Who wrote the comment
    required: true,
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article", // Which article this comment belongs to
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
