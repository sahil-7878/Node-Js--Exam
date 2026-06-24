const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User schema - stores username, password (hashed), role, and their articles
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"], // Only these two roles are allowed
    default: "user",
  },
  articles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article", // Reference to Article model
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Before saving user, hash the password automatically
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if password not changed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password in DB
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
