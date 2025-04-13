require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User"); // Adjust path if needed

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Function to create users
async function seedUsers() {
    const users = [
        { name: "Collector 11", email: "collector11@gmail.com", password: "Collector@123", role: "collector" },
        { name: "Collector 12", email: "collector12@gmail.com", password: "Collector@123", role: "collector" },
        { name: "Collector 13", email: "collector13@gmail.com", password: "Collector@123", role: "collector" },
        { name: "Collector 14", email: "collector14@gmail.com", password: "Collector@123", role: "collector" },
        { name: "Collector 15", email: "collector15@gmail.com", password: "Collector@123", role: "collector" },
        { name: "Collector 16", email: "collector16@gmail.com", password: "Collector@123", role: "collector" },
        { name: "Collector 17", email: "collector17@gmail.com", password: "Collector@123", role: "collector" },
        { name: "Collector 18", email: "collector18@gmail.com", password: "Collector@123", role: "collector" },
        { name: "Collector 19", email: "collector19@gmail.com", password: "Collector@123", role: "collector" },
        { name: "Collector 20", email: "collector20@gmail.com", password: "Collector@123", role: "collector" }
    ];

    for (let user of users) {
        try {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const newUser = new User({ ...user, password: hashedPassword });

            await newUser.save();
            console.log(`✅ Created: ${user.name} (${user.role})`);
        } catch (error) {
            console.error(`❌ Error creating ${user.name}:`, error.message);
        }
    }

    mongoose.disconnect();
    console.log("✅ Seeding Complete. Database Disconnected.");
}

// Run the function
seedUsers();
