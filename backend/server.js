const express = require("express");
const cors = require("cors");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node"); // ✅ Correct import for new lowdb versions
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Define database file path
const dbFilePath = path.join(__dirname, "shipments.json");

// Ensure shipments.json exists
if (!fs.existsSync(dbFilePath)) {
    console.log("Creating shipments.json...");
    fs.writeFileSync(dbFilePath, JSON.stringify({ shipments: [] }, null, 2));
}

// Set up database
const adapter = new JSONFile(dbFilePath);
const db = new Low(adapter);
async function initializeDB() {
    await db.read();
    db.data ||= { shipments: [] };
    await db.write();
}
initializeDB();

app.use(express.json());
app.use(cors());

// API Route to Get Shipment History
app.get("/api/shipments", async (req, res) => {
    await db.read();
    res.json(db.data.shipments || []);
});

// API Route to Submit a Shipment
app.post("/api/submit-shipment", async (req, res) => {
    const { productName, category, destination, weight } = req.body;

    if (!productName || !category || !destination || !weight) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const shipment = { productName, category, destination, weight, date: new Date().toISOString() };
    db.data.shipments.push(shipment);
    await db.write();

    res.json({ message: "✅ Shipment saved successfully!", shipment });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
