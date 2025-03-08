// Import necessary packages
const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Only import multer once
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const session = require("express-session");
require("dotenv").config(); // Load environment variables from .env file
const { OpenAI } = require("openai"); // Import OpenAI package

// Set up the Express app
const app = express();
const PORT = process.env.PORT || 10000;

// Set up storage engine for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // 'uploads' folder to store files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Generating a unique name for each file
    }
});

// Set up the file upload middleware
const upload = multer({ storage: storage });

// Initialize OpenAI API client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Securely using the API key
});

// Set up middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); // Serve uploaded invoices publicly

app.use(
    session({
        secret: "your-secret-key",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, 
    })
);

// Your routes go here, like /api/signup, /api/login, etc.

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// 📦 Serve Tariff Data API
const tariffFilePath = path.join(__dirname, "tariff_data.json");

// Ensure tariff_data.json exists
if (!fs.existsSync(tariffFilePath)) {
    console.log("Error: tariff_data.json not found!");
} else {
    app.get("/api/tariffs", (req, res) => {
        res.sendFile(tariffFilePath);
    });
}

// 🚪 Logout Route
app.post("/api/logout", (req, res) => {
    req.session.destroy();
    res.json({ message: "Logged out successfully!" });
});

// 📚 OpenAI Chatbot Endpoint
app.post("/api/chatbot", async (req, res) => {
    const { userMessage } = req.body;

    if (!userMessage) {
        return res.status(400).json({ message: "Please provide a message." });
    }

    try {
        // Make a request to the OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Or gpt-4 if you want
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: userMessage }
            ],
        });

        // Extract the chatbot reply
        const chatbotReply = response.choices[0].message.content;

        res.json({ reply: chatbotReply });
    } catch (error) {
        console.error("Error calling OpenAI:", error);
        res.status(500).json({ message: "Error communicating with OpenAI." });
    }
});

