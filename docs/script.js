document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const productName = document.getElementById("product-name").value;
        const category = document.getElementById("category").value;
        const destination = document.getElementById("destination").value.toLowerCase();
        const weight = parseFloat(document.getElementById("weight").value);

        if (!productName || !category || !destination || !weight) {
            alert("Please fill in all fields.");
            return;
        }

        // Basic Compliance Rules
        let issues = [];

        // 🚫 Rule 1: Restricted Countries (Example: North Korea, Iran)
        const restrictedCountries = ["north korea", "iran"];
        if (restrictedCountries.includes(destination)) {
            issues.push("Shipping to this country is restricted.");
        }

        // 🚫 Rule 2: Weight Limit (Example: Max 50kg)
        if (weight > 50) {
            issues.push("Shipment weight exceeds the allowed limit (50kg max).");
        }

        // 🚫 Rule 3: Prohibited Categories (Example: Explosives, Drugs)
        const prohibitedCategories = ["explosives", "drugs", "firearms"];
        if (prohibitedCategories.includes(category.toLowerCase())) {
            issues.push(`"${category}" is a prohibited item and cannot be shipped.`);
        }

        // Display Compliance Check Results
        if (issues.length > 0) {
            alert("⚠️ Compliance Issues Found:\n\n" + issues.join("\n"));
            return;
        }

        alert("✅ Shipment is compliant! Proceeding with submission.");
    });
});
