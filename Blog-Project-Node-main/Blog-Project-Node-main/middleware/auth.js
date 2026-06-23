const jwt = require("jsonwebtoken");

const JWT_SECRET = "myblogsecretkey123";

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/login");
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).send("Access Denied! Admins only.");
  }
};

// Middleware to set user info for all views (optional user)
const setUser = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      res.locals.currentUser = decoded;
    } catch (err) {
      res.locals.currentUser = null;
    }
  } else {
    res.locals.currentUser = null;
  }
  next();
};

module.exports = { verifyToken, isAdmin, setUser, JWT_SECRET };
