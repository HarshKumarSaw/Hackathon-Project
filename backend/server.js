const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;

// Replace with your OpenAI API Key
const OPENAI_API_KEY = "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";

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

// AI-Powered Compliance Suggestions
async function getComplianceSuggestion(productName, category, destination) {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert in international trade compliance. Suggest missing documents and regulations."
                    },
                    {
                        role: "user",
                        content: `I am shipping a ${productName} under the category "${category}" to ${destination}. What compliance documents are required?`
                    }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("AI Suggestion Error:", error);
        return "AI suggestion service is unavailable.";
    }
}

// API Route to Receive and Validate Shipment Data
app.post("/api/submit-shipment", async (req, res) => {
    const { productName, category, destination, weight } = req.body;

    if (!productName || !category || !destination || !weight) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const complianceIssues = checkCompliance(productName, category, destination, weight);

    let aiSuggestion = "No suggestions available.";
    if (complianceIssues.length === 0) {
        aiSuggestion = await getComplianceSuggestion(productName, category, destination);
    }

    if (complianceIssues.length > 0) {
        return res.status(400).json({
            message: "⚠️ Compliance Issues Found",
            issues: complianceIssues,
            suggestion: aiSuggestion
        });
    }

    res.json({ message: "✅ Shipment is compliant!", suggestion: aiSuggestion });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
