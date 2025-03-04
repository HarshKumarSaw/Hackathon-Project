const express = require("express");
const cors = require("cors");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

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
app.use("/uploads", express.static("uploads")); // Serve uploaded invoices publicly

// Multer Setup for Invoice Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir); // Create uploads folder if missing
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 🚫 Compliance Checking Function (Blocks Restricted Shipments)
function checkCompliance(productName, category, destination, weight) {
    let issues = [];

    const restrictedCountries = ["north korea", "iran"];
    if (restrictedCountries.includes(destination.toLowerCase())) {
        issues.push("Shipping to this country is restricted.");
    }

    const prohibitedCategories = ["explosives", "drugs", "firearms"];
    if (prohibitedCategories.includes(category.toLowerCase())) {
        issues.push(`"${category}" is a prohibited item and cannot be shipped.`);
    }

    if (weight > 50) {
        issues.push("Shipment weight exceeds the allowed limit (50kg max).");
    }

    return issues;
}

// API Route to Submit a Shipment with Invoice Upload
app.post("/api/submit-shipment", upload.single("invoice"), async (req, res) => {
    const { productName, category, destination, weight } = req.body;
    const invoicePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!productName || !category || !destination || !weight) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // 🚫 Check Compliance Before Saving
    const complianceIssues = checkCompliance(productName, category, destination, weight);
    if (complianceIssues.length > 0) {
        return res.status(400).json({ message: "⚠️ Compliance Issues Found", issues: complianceIssues });
    }

    // ✅ Save Shipment Only If Compliant
    const shipment = {
        productName,
        category,
        destination,
        weight,
        invoice: invoicePath,
        date: new Date().toISOString()
    };

    db.data.shipments.push(shipment);
    await db.write();

    res.json({ message: "✅ Shipment saved successfully!", shipment });
});

// API Route to Get Shipment History
app.get("/api/shipments", async (req, res) => {
    await db.read();
    res.json(db.data.shipments || []);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
