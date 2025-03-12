import jwt from "jsonwebtoken";
import User from '../models/User.js';

export const signup = async (req, res) => {
  const { email, username, password, smtppassword } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email or username." });
    }

    // Save the plain password directly (not recommended for production use)
    const user = new User({
      email,
      username,
      password, // Store the plain text password
      smtppassword,
    });
    const savedUser = await user.save();

    // Include user ID and all provided fields except sensitive data
    const userData = {
      id: savedUser._id,
      email: savedUser.email,
      username: savedUser.username,
      smtppassword: savedUser.smtppassword, // Remove if sensitive
    };

    res.status(201).json({ message: "Your details are saved. Wait for account activation.", user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving user." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found.");
    if (!user.isActive) return res.status(403).send("Account not activated.");

    // Compare the plain text password directly
    if (password !== user.password) {
      return res.status(401).send("Invalid credentials.");
    }

    const token = jwt.sign({ id: user._id }, "secret", { expiresIn: "1h" });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, smtppassword: user.smtppassword } });

  } catch (err) {
    res.status(500).send("Login failed.");
  }
};
