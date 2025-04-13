const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();
const nodemailer = require("nodemailer");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const RESET_SECRET = process.env.RESET_SECRET || "some_secret_reset_key";

// Allowed roles
const allowedRoles = ["resident", "collector"];

// ✅ Register User
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Server error" });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

        const token = jwt.sign(
            { id: user._id, role: user.role },   // ✅ Include role in the token
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // ✅ Send token + role in the response
        res.json({
            message: "Login successful",
            token,
            role: user.role   // 🔥 Include role separately
        });

    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Generate a reset token valid for 15 minutes
        const resetToken = jwt.sign({ id: user._id }, RESET_SECRET, { expiresIn: "15m" });

        // Send reset email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetLink = `http://localhost:5173/reset-password/${resetToken}`; // React URL!

        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: "Password Reset Request",
            text: `Click the link below to reset your password:\n${resetLink}\nThis link is valid for 15 minutes.`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "Password reset link sent to your email" });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Reset Password
router.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) return res.status(400).json({ error: "New password is required" });

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, RESET_SECRET);
        } catch (err) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Hash new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Password reset successfully" });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;
