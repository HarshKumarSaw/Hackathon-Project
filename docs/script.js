document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const resultsDiv = document.getElementById("compliance-results");
    const historyDiv = document.getElementById("shipment-history");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const productName = document.getElementById("product-name").value;
        const category = document.getElementById("category").value.toLowerCase();
        const destination = document.getElementById("destination").value.toLowerCase();
        const weight = parseFloat(document.getElementById("weight").value);
        const invoice = document.getElementById("invoice").files[0];

        // Calculate Risk Score
        const riskLevel = calculateRiskScore(category, destination, weight);

        const formData = new FormData();
        formData.append("productName", productName);
        formData.append("category", category);
        formData.append("destination", destination);
        formData.append("weight", weight);
        formData.append("invoice", invoice);

        resultsDiv.innerHTML = "";
        resultsDiv.className = "";

        try {
            const response = await fetch("https://hackathon-project-5oha.onrender.com/api/submit-shipment", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            let riskMessage = `<span class="risk-message risk-low">🟢 Low Risk: Shipment is safe for compliance.</span>`;

            if (riskLevel === "HIGH") {
                riskMessage = `<span class="risk-message risk-high">🔴 High Risk: This shipment may be rejected! Double-check compliance.</span>`;
                resultsDiv.classList.add("red");
            } else if (riskLevel === "MEDIUM") {
                riskMessage = `<span class="risk-message risk-medium">🟡 Medium Risk: Some restrictions apply. Review before shipping.</span>`;
                resultsDiv.classList.add("yellow");
            } else {
                resultsDiv.classList.add("green");
            }

            if (response.status === 400) {
                resultsDiv.className = "red";
                resultsDiv.innerHTML = "⚠️ Compliance Issues Found:<br>" + result.issues.join("<br>");
            } else {
                resultsDiv.className = "green";
                resultsDiv.innerHTML = `✅ ${result.message} <br> ${riskMessage}`;
                loadShipmentHistory(); // Refresh shipment history
            }
        } catch (error) {
            resultsDiv.className = "red";
            resultsDiv.innerHTML = "❌ Error connecting to the server. Please try again later.";
            console.error("Backend Error:", error);
        }
    });

    // Load Shipment History
    async function loadShipmentHistory() {
        try {
            const response = await fetch("https://hackathon-project-5oha.onrender.com/api/shipments");
            const shipments = await response.json();

            if (shipments.length === 0) {
                historyDiv.innerHTML = "No shipments recorded yet.";
                return;
            }

            historyDiv.innerHTML = "<h2>Shipment History</h2>";
            shipments.forEach(shipment => {
                historyDiv.innerHTML += `
                    <div class="shipment-entry">
                        <strong>${shipment.productName}</strong> (${shipment.category})<br>
                        Destination: ${shipment.destination}<br>
                        Weight: ${shipment.weight}kg<br>
                        Date: ${new Date(shipment.date).toLocaleString()}<br>
                        Invoice: ${shipment.invoice ? `<a href="https://hackathon-project-5oha.onrender.com${shipment.invoice}" target="_blank">View Invoice</a>` : "No Invoice Uploaded"}<br>
                        <hr>
                    </div>
                `;
            });
        } catch (error) {
            console.error("Error loading shipment history:", error);
        }
    }

    loadShipmentHistory(); // Load history on page load

    // Risk Score Calculation Function
    function calculateRiskScore(category, destination, weight) {
        let riskScore = 0;

        // 🚨 High-Risk Destinations (Higher chance of rejection)
        const highRiskCountries = ["russia", "iran", "north korea", "syria"];
        if (highRiskCountries.includes(destination.toLowerCase())) {
            riskScore += 3;
        }

        // ⚠️ Medium-Risk Destinations (Some restrictions)
        const mediumRiskCountries = ["china", "brazil", "mexico"];
        if (mediumRiskCountries.includes(destination.toLowerCase())) {
            riskScore += 2;
        }

        // 🚫 Prohibited Categories (Automatic High Risk)
        const prohibitedCategories = ["firearms", "explosives", "drugs", "alcohol"];
        if (prohibitedCategories.includes(category.toLowerCase())) {
            return "HIGH"; // Immediate rejection risk
        }

        // 📦 Large Shipments = Higher Scrutiny
        if (weight > 30) {
            riskScore += 2;
        } else if (weight > 10) {
            riskScore += 1;
        }

        // 🎯 Final Risk Score
        if (riskScore >= 4) {
            return "HIGH";
        } else if (riskScore >= 2) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }
});
