const mongoose = require("mongoose");

// Article schema - stores title, content, author reference, and comments
const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links to User model
    required: true,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment", // Links to Comment model
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;
