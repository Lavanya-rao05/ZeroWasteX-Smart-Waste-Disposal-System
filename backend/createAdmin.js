const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/User"); // Adjust the path as needed

mongoose.connect("mongodb+srv://lavanyarao0502:i48d9cVtnfsZGZXL@cluster0.o6khg.mongodb.net/waste-disposal-notifier");

async function createAdmin() {
    const hashedPassword = await bcrypt.hash("Lavanya0527@", 10);

    const adminUser = new User({
        name: "Lavanya Rao",
        email: "lavanyarao0502@gmail.com",
        password: hashedPassword,
        role: "admin",
        lastWastePickup: null
    });

    await adminUser.save();
    console.log("Admin user created successfully!");
    mongoose.disconnect();
}

createAdmin();
