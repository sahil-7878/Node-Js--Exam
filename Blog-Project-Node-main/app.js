const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");

const connectDB = require("./config/db");
const { setUser } = require("./middleware/auth");
const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes");

const app = express();
const PORT = 9000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(setUser);

app.use("/", authRoutes);
app.use("/", articleRoutes);

app.get("/", (req, res) => {
    res.redirect("/articles");
});

const startServer = async () => {
    try {
        await connectDB();

        mongoose.connection.on("connected", () => {
            console.log("MongoDB Connected");
        });

        mongoose.connection.on("error", (err) => {
            console.log("MongoDB Error:", err);
        });

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log("Database Connection Failed:", error);
    }
};

startServer();