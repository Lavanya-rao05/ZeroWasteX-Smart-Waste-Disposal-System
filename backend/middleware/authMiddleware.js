const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
    const token = req.header("Authorization");

    console.log("Received Token:", token); // Debugging log

    if (!token) return res.status(401).json({ error: "Access denied" });

    try {
        const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
        console.log("Decoded JWT:", decoded); // Check if `id` exists
        req.user = decoded;
        console.log("Authenticated User ID:", req.user?.id); // Ensure `id` exists
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        res.status(400).json({ error: "Invalid token" });
    }
};


// Middleware to authorize specific roles (RBAC)
const authorize = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    next();
};

module.exports = { authenticate, authorize };
