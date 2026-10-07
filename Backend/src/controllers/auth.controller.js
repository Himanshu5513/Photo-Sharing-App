const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Name, email, and password are required" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ msg: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT);
    res.cookie("token", token)
    return res.status(201).json({ msg: "User Registered Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Something went wrong" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT);
    res.cookie("token", token)
    return res.status(200).json({ msg: "Logged In Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Something went wrong" });
  }
}

module.exports = { register, login };
