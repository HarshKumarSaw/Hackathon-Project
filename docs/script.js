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

        // Send data to backend for compliance validation
        try {
            const response = await fetch("http://localhost:5000/api/submit-shipment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productName, category, destination, weight })
            });

            const result = await response.json();

            if (response.status === 400) {
                resultsDiv.className = "red";
                resultsDiv.innerHTML = "⚠️ Compliance Issues Found:<br>" + result.issues.join("<br>");
            } else {
                resultsDiv.className = "green";
                resultsDiv.innerHTML = "✅ " + result.message;
            }
        } catch (error) {
            resultsDiv.className = "red";
            resultsDiv.innerHTML = "❌ Error connecting to the server. Please try again later.";
            console.error("Backend Error:", error);
        }
    });
});
