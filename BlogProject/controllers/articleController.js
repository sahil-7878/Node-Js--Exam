const Article = require("../models/Article");
const Comment = require("../models/Comment");
const User = require("../models/User");

// GET /articles - Show all articles (newest first)
const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find()
      .populate("author", "username") // Get author's username from User model
      .sort({ createdAt: -1 });       // Latest articles first
    res.render("articleList", { articles });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// GET /my-articles - Show only the logged-in user's articles
const getMyArticles = async (req, res) => {
  try {
    const articles = await Article.find({ author: req.user.id })
      .populate("author", "username")
      .sort({ createdAt: -1 });
    res.render("myArticles", { articles });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// GET /articles/create - Show create article form
const getCreateArticle = (req, res) => {
  res.render("articleForm", { article: null }); // null = new article (not editing)
};

// POST /articles/create - Save new article to database
const postCreateArticle = async (req, res) => {
  try {
    const { title, content } = req.body;

    const newArticle = new Article({
      title,
      content,
      author: req.user.id, // Set current logged-in user as author
    });

    const savedArticle = await newArticle.save();

    // Also add this article's ID to user's articles array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { articles: savedArticle._id },
    });

    res.redirect("/articles");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// GET /article/:id - Show single article with comments
const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate("author", "username")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" }, // Also get comment author names
      });

    if (!article) {
      return res.status(404).send("Article not found");
    }

    res.render("articleItem", { article });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// GET /article/edit/:id - Show edit form (only for author or admin)
const getEditArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).send("Article not found");
    }

    // Only the article's author or an admin can edit
    if (article.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).send("Access Denied!");
    }

    res.render("articleForm", { article }); // Pass article data to pre-fill form
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// POST /article/edit/:id - Update article in database
const postEditArticle = async (req, res) => {
  try {
    const { title, content } = req.body;
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).send("Article not found");
    }

    if (article.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).send("Access Denied!");
    }

    // Update the fields and save
    article.title = title;
    article.content = content;
    await article.save();

    res.redirect("/article/" + article._id);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// POST /article/delete/:id - Delete article (author or admin only)
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).send("Article not found");
    }

    if (article.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).send("Access Denied!");
    }

    // Remove article ID from user's articles list
    await User.findByIdAndUpdate(article.author, {
      $pull: { articles: article._id },
    });

    // Delete all comments on this article
    await Comment.deleteMany({ article: article._id });

    // Finally delete the article itself
    await Article.findByIdAndDelete(req.params.id);

    res.redirect("/articles");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// POST /article/:id/comment - Add a comment to an article
const postComment = async (req, res) => {
  try {
    const { text } = req.body;

    const newComment = new Comment({
      text,
      author: req.user.id,
      article: req.params.id,
    });

    const savedComment = await newComment.save();

    // Add comment ID to article's comments array
    await Article.findByIdAndUpdate(req.params.id, {
      $push: { comments: savedComment._id },
    });

    res.redirect("/article/" + req.params.id);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// POST /article/:articleId/comment/:commentId/delete - Delete a comment
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    // Only comment author or admin can delete
    if (comment.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).send("Access Denied!");
    }

    // Remove comment ID from article's comments array
    await Article.findByIdAndUpdate(comment.article, {
      $pull: { comments: comment._id },
    });

    // Delete the comment from DB
    await Comment.findByIdAndDelete(req.params.commentId);

    res.redirect("/article/" + req.params.articleId);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  getAllArticles,
  getMyArticles,
  getCreateArticle,
  postCreateArticle,
  getArticleById,
  getEditArticle,
  postEditArticle,
  deleteArticle,
  postComment,
  deleteComment,
};
