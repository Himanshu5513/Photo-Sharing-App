const postModel = require("../models/post.model");
const post = require("../services/post.service");

async function createPost(req, res) {
  const { caption } = req.body;
  const upload = await post(req.file.buffer);

  try {
    const userPost = await postModel.create({
      user: req.userId,
      img: upload.url,
      caption: caption,
    });
    res.status(201).json({
      msg: "Post Created successfully",
      userPost,
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      msg: "Bad Request",
    });
  }
}

async function fetchPost(req, res) {
  try {
    const posts = await postModel.find({ user: req.userId });
    return res.status(200).json({
      msg: posts.length ? "Posts fetched" : "No posts yet",
      posts,
    });
  } catch (err) {
    return res.status(400).json({
      msg: "Bad Request",
    });
  }
}

module.exports = { createPost, fetchPost };
