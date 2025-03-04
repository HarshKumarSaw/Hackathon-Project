const express = require("express");
const cors = require("cors");
const { Low, JSONFile } = require("lowdb"); // Simple JSON database

const app = express();
const PORT = process.env.PORT || 5000;

// Set up database
const db = new Low(new JSONFile("shipments.json"));
db.read().then(() => {
    db.data ||= { shipments: [] };
    db.write();
});

app.use(express.json());
app.use(cors());

// Compliance Checking Function
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

// API Route to Save Shipment
app.post("/api/submit-shipment", async (req, res) => {
    const { productName, category, destination, weight } = req.body;

    if (!productName || !category || !destination || !weight) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const complianceIssues = checkCompliance(productName, category, destination, weight);

    if (complianceIssues.length > 0) {
        return res.status(400).json({ message: "⚠️ Compliance Issues Found", issues: complianceIssues });
    }

    const shipment = { productName, category, destination, weight, date: new Date().toISOString() };
    db.data.shipments.push(shipment);
    await db.write();

    res.json({ message: "✅ Shipment saved successfully!", shipment });
});

// API Route to Get Shipment History
app.get("/api/shipments", async (req, res) => {
    await db.read();
    res.json(db.data.shipments);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
