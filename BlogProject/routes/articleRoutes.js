const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/auth");
const {
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
} = require("../controllers/articleController");

// Public routes (no login required)
router.get("/articles", getAllArticles);
router.get("/article/:id", getArticleById);

// Protected routes (login required → verifyToken middleware)
router.get("/my-articles", verifyToken, getMyArticles);
router.get("/articles/create", verifyToken, getCreateArticle);
router.post("/articles/create", verifyToken, postCreateArticle);
router.get("/article/edit/:id", verifyToken, getEditArticle);
router.post("/article/edit/:id", verifyToken, postEditArticle);
router.post("/article/delete/:id", verifyToken, deleteArticle);
router.post("/article/:id/comment", verifyToken, postComment);
router.post("/article/:articleId/comment/:commentId/delete", verifyToken, deleteComment);

module.exports = router;
