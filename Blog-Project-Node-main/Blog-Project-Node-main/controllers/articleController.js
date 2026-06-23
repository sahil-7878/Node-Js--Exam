const Article = require("../models/Article");
const Comment = require("../models/Comment");
const User = require("../models/User");

const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find()
      .populate("author", "username")
      .sort({ createdAt: -1 });
    res.render("articleList", { articles });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

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

const getCreateArticle = (req, res) => {
  res.render("articleForm", { article: null });
};

const postCreateArticle = async (req, res) => {
  try {
    const { title, content } = req.body;

    const newArticle = new Article({
      title,
      content,
      author: req.user.id,
    });

    const savedArticle = await newArticle.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: { articles: savedArticle._id },
    });

    res.redirect("/articles");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate("author", "username")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" },
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

const getEditArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).send("Article not found");
    }

    if (article.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).send("Access Denied!");
    }

    res.render("articleForm", { article });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

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

    article.title = title;
    article.content = content;
    await article.save();

    res.redirect("/article/" + article._id);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).send("Article not found");
    }

    if (article.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).send("Access Denied!");
    }

    await User.findByIdAndUpdate(article.author, {
      $pull: { articles: article._id },
    });

    await Comment.deleteMany({ article: article._id });

    await Article.findByIdAndDelete(req.params.id);

    res.redirect("/articles");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

const postComment = async (req, res) => {
  try {
    const { text } = req.body;

    const newComment = new Comment({
      text,
      author: req.user.id,
      article: req.params.id,
    });

    const savedComment = await newComment.save();

    await Article.findByIdAndUpdate(req.params.id, {
      $push: { comments: savedComment._id },
    });

    res.redirect("/article/" + req.params.id);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    if (comment.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).send("Access Denied!");
    }

    await Article.findByIdAndUpdate(comment.article, {
      $pull: { comments: comment._id },
    });

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
