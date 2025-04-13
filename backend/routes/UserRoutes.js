const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Get all users (ONLY for Admins)
router.get("/", authenticate, authorize(["admin"]), async (req, res) => {
    try {
        const users = await User.find({}, "-password"); // Exclude passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
router.put("/:id/role", authenticate, authorize(["admin"]), async (req, res) => {
    try {
        const { role } = req.body;
        if (!["resident", "collector"].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User role updated", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Delete User (Only Admin)
router.delete("/:id", authenticate, authorize(["admin"]), async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Route to Create a New User
router.post("/", async (req, res) => {
    try {
        console.log("Received Request:", req.body);

        const { name, email, password, role, lastWastePickup } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "resident",
            lastWastePickup: lastWastePickup || null
        });

        await newUser.save();
        res.status(201).json({ message: "User created successfully", user: newUser });

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

// 🔥 Route to get residents with no pickup in the last 7 days
router.get("/residents/no-pickup", authenticate, authorize(["admin", "collector"]), async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const residents = await User.find({
            role: "resident",
            $or: [{ lastWastePickup: { $lt: sevenDaysAgo } }, { lastWastePickup: null }]
        });

        res.status(200).json({ message: "Residents without pickup in 7+ days", residents });
    } catch (error) {
        console.error("Error fetching residents:", error);
        res.status(500).json({ error: "Server error" });
    }
});



module.exports = router;
