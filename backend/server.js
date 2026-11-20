
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Student = require("./models/student");
const Admin = require("./models/admin");
const Application = require("./models/application");

const app = express();

app.use(cors());
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
    res.send("Placement Portal Backend is running!");
});

// Student Registration API
app.post("/api/register", async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            course,
            year,
            college
        } = req.body;

        if (
            !firstName?.trim() ||
            !lastName?.trim() ||
            !email?.trim() ||
            !password ||
            !phone?.trim() ||
            !course ||
            !year ||
            !college?.trim()
        ) {
            return res.status(400).json({
                message: "Please fill all required fields."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingStudent = await Student.findOne({
            email: normalizedEmail
        });

        if (existingStudent) {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await Student.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone.trim(),
            course,
            year,
            college: college.trim()
        });

        return res.status(201).json({
            message: "Registration successful!",
            student: {
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email
            }
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }

        return res.status(500).json({
            message: "Registration failed. Please try again."
        });
    }
});

// Student Login API
app.post("/api/login", async (req, res) => {
    console.log("LOGIN API HIT");
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const student = await Student.findOne({
            email: email.trim().toLowerCase()
        });

        if (!student) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            student.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        return res.status(200).json({
            message: "Student login successful!",
            student: {
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Login failed. Please try again."
        });
    }
});
// Apply for a Job API
app.post("/api/applications", async (req, res) => {
    try {
        const {
            studentId,
            title,
            company,
            location,
            applicationLink
        } = req.body;

        if (!studentId || !title || !company) {
            return res.status(400).json({
                message: "Required application details missing."
            });
        }

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        const existingApplication = await Application.findOne({
            student: student._id,
            title,
            company
        });

        if (existingApplication) {
            return res.status(409).json({
                message: "You have already applied for this job."
            });
        }

        const application = await Application.create({
            student: student._id,
            studentName: student.firstName + " " + student.lastName,
            studentEmail: student.email,
            title,
            company,
            location: location || "Not specified",
            applicationLink: applicationLink || ""
        });

        return res.status(201).json({
            message: "Application submitted successfully!",
            application
        });

    } catch (error) {
        console.error("Application Error:", error.message);

        return res.status(500).json({
            message: "Application submission failed."
        });
    }
});
// Get logged-in student's details
app.get("/api/student/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .select("-password");

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({ student });

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch student details"
        });
    }
});

app.get("/api/jobs/external", async (req, res) => {
    try {
        const response = await fetch(
            "https://himalayas.app/jobs/api?limit=20"
        );

        if (!response.ok) {
            throw new Error("Himalayas API response failed");
        }

        const data = await response.json();

        res.json({
            success: true,
            totalCount: data.totalCount,
            jobs: data.jobs
        });

    } catch (error) {
        console.error("External Jobs Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Jobs fetch nahi ho paayi"
        });
    }
});
// Admin Login API
app.post("/api/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const admin = await Admin.findOne({
            email: email.trim().toLowerCase()
        });

        if (!admin) {
            return res.status(401).json({
                message: "Invalid admin email or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid admin email or password."
            });
        }

        return res.status(200).json({
            message: "Admin login successful!",
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error("Admin Login Error:", error.message);

        return res.status(500).json({
            message: "Admin login failed."
        });
    }
});
// Start Server
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected successfully!");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
}

startServer();
