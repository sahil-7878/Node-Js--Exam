const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");

const getRegister = (req, res) => {
  res.render("register", { error: null });
};

const postRegister = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render("register", { error: "Username already exists!" });
    }

    const newUser = new User({
      username,
      password,
      role: role || "user",
    });

    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    console.log(err);
    res.render("register", { error: "Something went wrong. Try again." });
  }
};

const getLogin = (req, res) => {
  res.render("login", { error: null });
};

const postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.render("login", { error: "Invalid username or password!" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid username or password!" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.redirect("/articles");
  } catch (err) {
    console.log(err);
    res.render("login", { error: "Something went wrong. Try again." });
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};

module.exports = { getRegister, postRegister, getLogin, postLogin, logout };
