const express = require("express");
const multer = require("multer");
const postcontroller = require("../controllers/post.controller");
const requireAuth = require("../middleware/auth.middleware");
const requirepost = require("../middleware/post.middleware");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/post",
  requireAuth,
  upload.single("img"),
  postcontroller.createPost,
);
router.get("/feed", requirepost, postcontroller.fetchPost);

module.exports = router;
