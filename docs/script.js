document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const resultsDiv = document.getElementById("compliance-results");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const productName = document.getElementById("product-name").value;
        const category = document.getElementById("category").value.toLowerCase();
        const destination = document.getElementById("destination").value.toLowerCase();
        const weight = parseFloat(document.getElementById("weight").value);

        // Clear previous results
        resultsDiv.innerHTML = "";
        resultsDiv.className = "";

        if (!productName || !category || !destination || !weight) {
            resultsDiv.className = "red";
            resultsDiv.innerHTML = "⚠️ Please fill in all fields.";
            return;
        }

        let issues = [];

        // 🚫 Rule 1: Restricted Countries
        const restrictedCountries = ["north korea", "iran"];
        if (restrictedCountries.includes(destination)) {
            issues.push("Shipping to this country is restricted.");
        }

        // 🚫 Rule 2: Weight Limit (Max 50kg)
        if (weight > 50) {
            issues.push("Shipment weight exceeds the allowed limit (50kg max).");
        }

        // 🚫 Rule 3: Prohibited Categories
        const prohibitedCategories = ["explosives", "drugs", "firearms"];
        if (prohibitedCategories.includes(category)) {
            issues.push(`"${category}" is a prohibited item and cannot be shipped.`);
        }

        // Display Compliance Issues in the Page
        if (issues.length > 0) {
            resultsDiv.className = "red";
            resultsDiv.innerHTML = "⚠️ Compliance Issues Found:<br>" + issues.join("<br>");
            return;
        }

        resultsDiv.className = "green";
        resultsDiv.innerHTML = "✅ Shipment is compliant! Proceeding with submission.";
    });
});
