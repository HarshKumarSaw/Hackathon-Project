const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Compliance Checking Function
function checkCompliance(productName, category, destination, weight) {
    let issues = [];

    // 🚫 Rule 1: Restricted Countries
    const restrictedCountries = ["north korea", "iran"];
    if (restrictedCountries.includes(destination.toLowerCase())) {
        issues.push("Shipping to this country is restricted.");
    }

    // 🚫 Rule 2: Weight Limit (Max 50kg)
    if (weight > 50) {
        issues.push("Shipment weight exceeds the allowed limit (50kg max).");
    }

    // 🚫 Rule 3: Prohibited Categories
    const prohibitedCategories = ["explosives", "drugs", "firearms"];
    if (prohibitedCategories.includes(category.toLowerCase())) {
        issues.push(`"${category}" is a prohibited item and cannot be shipped.`);
    }

    return issues;
}

// API Route to Receive and Validate Shipment Data
app.post("/api/submit-shipment", (req, res) => {
    const { productName, category, destination, weight } = req.body;

    if (!productName || !category || !destination || !weight) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const complianceIssues = checkCompliance(productName, category, destination, weight);

    if (complianceIssues.length > 0) {
        return res.status(400).json({ message: "⚠️ Compliance Issues Found", issues: complianceIssues });
    }

    res.json({ message: "✅ Shipment is compliant! Proceeding with submission." });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
