const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/node");
        console.log("Database Connected Successfully");
    } catch (error) {
        console.error("Database Connection Error:", error.message);
    }
};

module.exports = connectDB;