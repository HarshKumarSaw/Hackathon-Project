const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Test Route
app.get("/", (req, res) => {
    res.send("Backend is running...");
});

// API Route to Receive Shipment Data
app.post("/api/submit-shipment", (req, res) => {
    const { productName, category, destination, weight } = req.body;

    if (!productName || !category || !destination || !weight) {
        return res.status(400).json({ message: "All fields are required." });
    }

    console.log("Received Shipment Data:", req.body);
    
    res.json({ message: "Shipment data received successfully!" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
