const express = require("express");
const router = require("./routes/user.route");
const cookie = require("cookie-parser");
const postRouter = require("../src/routes/post.route");

const app = express();
app.use(express.json());
app.use(cookie());

app.use("/api/auth", router);
app.use("/api/auth", postRouter);

module.exports = app;
