require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/admin");

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected!");
        const email = "khansurikeshav@gmail.com"
        const password = "Keshav@123"

        const hashedPassword = await bcrypt.hash(password, 10);

        await Admin.findOneAndUpdate(
            { email: email.trim().toLowerCase() },
            {
                name: "Keshav Khanduri",
                email: email.trim().toLowerCase(),
                password: hashedPassword,
                role: "admin"
            },
            {
                upsert: true,
                returnDocument: "after",
                runValidators: true
            }
        );

        console.log("Admin account created/updated successfully!");

    } catch (error) {
        console.error("Admin Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

createAdmin();