document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const productName = document.getElementById("product-name").value;
        const category = document.getElementById("category").value.toLowerCase();
        const destination = document.getElementById("destination").value.toLowerCase();
        const weight = parseFloat(document.getElementById("weight").value);

        alert("Debug: Form Submitted"); // Check if this alert appears

        if (!productName || !category || !destination || !weight) {
            alert("Please fill in all fields.");
            return;
        }

        let issues = [];

        // 🚫 Rule 1: Restricted Countries
        const restrictedCountries = ["north korea", "iran"];
        if (restrictedCountries.includes(destination)) {
            issues.push("Shipping to this country is restricted.");
            alert("Debug: Restricted country detected"); // Debugging alert
        }

        // 🚫 Rule 2: Weight Limit (Max 50kg)
        if (weight > 50) {
            issues.push("Shipment weight exceeds the allowed limit (50kg max).");
            alert("Debug: Weight limit exceeded"); // Debugging alert
        }

        // 🚫 Rule 3: Prohibited Categories
        const prohibitedCategories = ["explosives", "drugs", "firearms"];
        if (prohibitedCategories.includes(category)) {
            issues.push(`"${category}" is a prohibited item and cannot be shipped.`);
            alert("Debug: Prohibited category detected"); // Debugging alert
        }

        // Show compliance issues
        if (issues.length > 0) {
            alert("⚠️ Compliance Issues Found:\n\n" + issues.join("\n"));
            return;
        }

        alert("✅ Shipment is compliant! Proceeding with submission.");
    });
});
