const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");

// Show register page
const getRegister = (req, res) => {
  res.render("register", { error: null });
};

// Handle register form submission
const postRegister = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render("register", { error: "Username already exists!" });
    }

    // Create new user (password is hashed automatically by User model)
    const newUser = new User({
      username,
      password,
      role: role || "user",
    });

    await newUser.save();
    res.redirect("/login"); // Go to login after successful register
  } catch (err) {
    console.log(err);
    res.render("register", { error: "Something went wrong. Try again." });
  }
};

// Show login page
const getLogin = (req, res) => {
  res.render("login", { error: null });
};

// Handle login form submission
const postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.render("login", { error: "Invalid username or password!" });
    }

    // Check if entered password matches stored hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid username or password!" });
    }

    // Create JWT token with user info (expires in 1 day)
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Store token in HTTP-only cookie (can't be accessed by JavaScript → more secure)
    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.redirect("/articles");
  } catch (err) {
    console.log(err);
    res.render("login", { error: "Something went wrong. Try again." });
  }
};

// Logout: clear the token cookie and redirect to login
const logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};

module.exports = { getRegister, postRegister, getLogin, postLogin, logout };
