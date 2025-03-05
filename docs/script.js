document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const resultsDiv = document.getElementById("compliance-results");
    const historyDiv = document.getElementById("shipment-history");
    const destinationSelect = document.getElementById("destination");
    const riskIndicator = document.createElement("p"); // Create risk indicator element
    riskIndicator.id = "risk-indicator";
    destinationSelect.insertAdjacentElement("afterend", riskIndicator);

    // 🌍 Country Categorization
    const highRiskCountries = ["Russia", "Iran", "North Korea", "Syria"];
    const mediumRiskCountries = ["China", "Brazil", "Mexico"];
    const lowRiskCountries = ["USA", "Canada", "UK", "Germany", "France", "India", "Japan", "Australia", "Italy", "Spain"];

    // 🌎 Full List of Countries
    const allCountries = [...highRiskCountries, ...mediumRiskCountries, ...lowRiskCountries];

    // Populate Dropdown with Categorization
    function populateCountryDropdown() {
        const groupings = [
            { label: "🚨 High-Risk Countries", countries: highRiskCountries },
            { label: "⚠️ Medium-Risk Countries", countries: mediumRiskCountries },
            { label: "✅ Low-Risk Countries", countries: lowRiskCountries }
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

    // ✅ Show Risk Indicator Below Dropdown
    destinationSelect.addEventListener("change", function () {
        const selectedCountry = destinationSelect.value;

        if (highRiskCountries.includes(selectedCountry)) {
            riskIndicator.innerHTML = "🔴 <strong>High Compliance Risk:</strong> Strict checks required!";
            riskIndicator.style.color = "#b91c1c";
        } else if (mediumRiskCountries.includes(selectedCountry)) {
            riskIndicator.innerHTML = "🟡 <strong>Moderate Compliance Risk:</strong> Some restrictions apply.";
            riskIndicator.style.color = "#b45309";
        } else if (lowRiskCountries.includes(selectedCountry)) {
            riskIndicator.innerHTML = "🟢 <strong>Low Compliance Risk:</strong> Minimal compliance issues.";
            riskIndicator.style.color = "#047857";
        } else {
            riskIndicator.innerHTML = ""; // No message if no country selected
        }
    });

    // 🛠 Ensure Form Submission Works
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append("productName", document.getElementById("product-name").value);
        formData.append("category", document.getElementById("category").value.toLowerCase());
        formData.append("destination", destinationSelect.value);
        formData.append("weight", parseFloat(document.getElementById("weight").value));
        formData.append("invoice", document.getElementById("invoice").files[0]);

        resultsDiv.innerHTML = "";
        resultsDiv.className = "";

        try {
            const response = await fetch("https://hackathon-project-5oha.onrender.com/api/submit-shipment", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (response.status === 400) {
                resultsDiv.className = "red";
                resultsDiv.innerHTML = "⚠️ Compliance Issues Found:<br>" + result.issues.join("<br>");
            } else {
                resultsDiv.className = "green";
                resultsDiv.innerHTML = "✅ Shipment is compliant!";
                loadShipmentHistory();
            }
        } catch (error) {
            resultsDiv.className = "red";
            resultsDiv.innerHTML = "❌ Error connecting to the server.";
            console.error("Backend Error:", error);
        }
    });

    // ✅ Load Shipment History
    async function loadShipmentHistory() {
        try {
            const response = await fetch("https://hackathon-project-5oha.onrender.com/api/shipments");
            const shipments = await response.json();
            historyDiv.innerHTML = shipments.length === 0 ? "<p>No shipments recorded yet.</p>" : "";

            shipments.forEach(shipment => {
                const shipmentEntry = document.createElement("div");
                shipmentEntry.classList.add("shipment-entry");
                shipmentEntry.innerHTML = `
                    <strong>${shipment.productName}</strong> (${shipment.category})<br>
                    Destination: ${shipment.destination}<br>
                    Weight: ${shipment.weight}kg<br>
                    Date: ${new Date(shipment.date).toLocaleString()}<br>
                    Invoice: ${shipment.invoice ? `<a href="https://hackathon-project-5oha.onrender.com${shipment.invoice}" target="_blank">View Invoice</a>` : "No Invoice Uploaded"}<br>
                    <hr>
                `;
                historyDiv.appendChild(shipmentEntry);
            });
        } catch (error) {
            console.error("Error loading shipment history:", error);
        }
    }

    loadShipmentHistory();

    function calculateRiskScore(category, destination, weight) {
        let riskScore = 0;
        if (highRiskCountries.includes(destination)) riskScore += 3;
        if (mediumRiskCountries.includes(destination)) riskScore += 2;
        if (["firearms", "explosives", "drugs", "alcohol"].includes(category)) return "HIGH";
        if (weight > 30) riskScore += 2;
        if (weight > 10) riskScore += 1;
        return riskScore >= 4 ? "HIGH" : riskScore >= 2 ? "MEDIUM" : "LOW";
    }

    // Show selected file name
    document.getElementById("invoice").addEventListener("change", function () {
        document.getElementById("file-name").textContent = this.files.length > 0 ? this.files[0].name : "No file chosen";
    });
});
