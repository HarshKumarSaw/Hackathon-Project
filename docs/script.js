document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const resultsDiv = document.getElementById("compliance-results");
    const historyDiv = document.getElementById("shipment-history");
    const destinationSelect = document.getElementById("destination");

    // 🌍 Country Categorization
    const highRiskCountries = ["Russia", "Iran", "North Korea", "Syria"];
    const mediumRiskCountries = ["China", "Brazil", "Mexico"];
    const lowRiskCountries = ["USA", "Canada", "UK", "Germany", "France", "India", "Japan", "Australia", "Italy", "Spain"];

    // 🌎 Full List of Countries
    const allCountries = [
        ...highRiskCountries, ...mediumRiskCountries, ...lowRiskCountries,
        "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Austria",
        "Azerbaijan", "Bangladesh", "Belgium", "Bolivia", "Chile", "Colombia",
        "Denmark", "Dominican Republic", "Ecuador", "Egypt", "Ethiopia", "Finland",
        "Greece", "Hungary", "Indonesia", "Ireland", "Jordan", "Malaysia", "Nepal",
        "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru",
        "Philippines", "Poland", "Portugal", "Saudi Arabia", "South Africa",
        "South Korea", "Sweden", "Switzerland", "Thailand", "Turkey", "Ukraine",
        "United Arab Emirates", "Vietnam", "Zambia"
    ];

    // Populate Dropdown
    function populateCountryDropdown() {
        const groupings = [
            { label: "🚨 High-Risk Countries", countries: highRiskCountries },
            { label: "⚠️ Medium-Risk Countries", countries: mediumRiskCountries },
            { label: "✅ Low-Risk Countries", countries: lowRiskCountries },
            { label: "🌍 Other Countries", countries: allCountries.filter(c => 
                !highRiskCountries.includes(c) && !mediumRiskCountries.includes(c) && !lowRiskCountries.includes(c)) }
        ];

        destinationSelect.innerHTML = '<option value="">-- Select Country --</option>';
        groupings.forEach(group => {
            const optGroup = document.createElement("optgroup");
            optGroup.label = group.label;
            group.countries.forEach(country => {
                const option = document.createElement("option");
                option.value = country;
                option.textContent = country;
                optGroup.appendChild(option);
            });
            destinationSelect.appendChild(optGroup);
        });
    }
    populateCountryDropdown();

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const productName = document.getElementById("product-name").value;
        const category = document.getElementById("category").value.toLowerCase();
        const destination = destinationSelect.value;
        const weight = parseFloat(document.getElementById("weight").value);
        const invoice = document.getElementById("invoice").files[0];

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
            } else if (riskLevel === "MEDIUM") {
                riskMessage = `<span class="risk-message risk-medium">🟡 Medium Risk: Some restrictions apply. Review before shipping.</span>`;
            }

            if (response.status === 400) {
                resultsDiv.className = "red";
                resultsDiv.innerHTML = "⚠️ Compliance Issues Found:<br>" + result.issues.join("<br>");
            } else {
                resultsDiv.className = "green";
                resultsDiv.innerHTML = `
    <span class="success-icon">✅✅</span> ${result.message}
    <span class="risk-message">${riskMessage}</span>
`;
                loadShipmentHistory(); // Refresh shipment history
            }
        } catch (error) {
            resultsDiv.className = "red";
            resultsDiv.innerHTML = "❌ Error connecting to the server. Please try again later.";
            console.error("Backend Error:", error);
        }
    });

    // Load Shipment History (Ensures History is Working)
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

    // Risk Score Calculation Function (Ensuring Risk Calculation is Working)
    function calculateRiskScore(category, destination, weight) {
        let riskScore = 0;
        if (highRiskCountries.includes(destination)) riskScore += 3;
        if (mediumRiskCountries.includes(destination)) riskScore += 2;
        if (["firearms", "explosives", "drugs", "alcohol"].includes(category)) return "HIGH";
        if (weight > 30) riskScore += 2;
        if (weight > 10) riskScore += 1;
        return riskScore >= 4 ? "HIGH" : riskScore >= 2 ? "MEDIUM" : "LOW";
    }
});
