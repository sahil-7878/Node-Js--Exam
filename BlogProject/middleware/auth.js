const jwt = require("jsonwebtoken");

// Secret key for signing JWT tokens (keep this private in real projects)
const JWT_SECRET = "myblogsecretkey123";

// Middleware: Check if user is logged in (has valid token)
// If no token → redirect to login page
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Save user info in request
    next();
  } catch (err) {
    res.clearCookie("token"); // Remove invalid token
    return res.redirect("/login");
  }
};

// Middleware: Only allow admin users
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).send("Access Denied! Admins only.");
  }
};

// Middleware: Set currentUser for all EJS views (works for both logged-in and guests)
const setUser = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      res.locals.currentUser = decoded; // Available in all EJS templates
    } catch (err) {
      res.locals.currentUser = null; // Token invalid → treat as guest
    }
  } else {
    res.locals.currentUser = null; // No token → guest user
  }
  next();
};

module.exports = { verifyToken, isAdmin, setUser, JWT_SECRET };
