document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const resultsDiv = document.getElementById("compliance-results");
    const historyDiv = document.getElementById("shipment-history");
    const destinationSelect = document.getElementById("destination");
    const riskIndicator = document.createElement("p");
    riskIndicator.id = "risk-indicator";
    destinationSelect.insertAdjacentElement("afterend", riskIndicator);

    // 🌍 Country Risk Levels (Low, Medium, High)
    const countryRiskLevels = {
        "Afghanistan": "High", "Albania": "Low", "Algeria": "Medium", "Andorra": "Low", "Angola": "Medium",
        "Antigua and Barbuda": "Low", "Argentina": "Low", "Armenia": "Medium", "Australia": "Low", "Austria": "Low",
        "Azerbaijan": "Medium", "Bahamas": "Low", "Bahrain": "Low", "Bangladesh": "Medium", "Barbados": "Low",
        "Belarus": "High", "Belgium": "Low", "Belize": "Low", "Benin": "Medium", "Bhutan": "Low",
        "Bolivia": "Medium", "Bosnia and Herzegovina": "Low", "Botswana": "Low", "Brazil": "Medium", "Brunei": "Low",
        "Bulgaria": "Low", "Burkina Faso": "High", "Burundi": "High", "Cambodia": "Medium", "Cameroon": "High",
        "Canada": "Low", "Central African Republic": "High", "Chad": "High", "Chile": "Low", "China": "Medium",
        "Colombia": "Medium", "Comoros": "Medium", "Congo": "High", "Costa Rica": "Low", "Croatia": "Low",
        "Cuba": "High", "Cyprus": "Low", "Czech Republic": "Low", "Denmark": "Low", "Djibouti": "Medium",
        "Dominica": "Low", "Dominican Republic": "Low", "Ecuador": "Medium", "Egypt": "Medium", "El Salvador": "Medium",
        "Equatorial Guinea": "High", "Eritrea": "High", "Estonia": "Low", "Eswatini": "Low", "Ethiopia": "High",
        "Fiji": "Low", "Finland": "Low", "France": "Low", "Gabon": "Medium", "Gambia": "Low",
        "Georgia": "Low", "Germany": "Low", "Ghana": "Medium", "Greece": "Low", "Grenada": "Low",
        "Guatemala": "Medium", "Guinea": "High", "Guyana": "Medium", "Haiti": "High", "Honduras": "Medium",
        "Hungary": "Low", "Iceland": "Low", "India": "Low", "Indonesia": "Medium", "Iran": "High",
        "Iraq": "High", "Ireland": "Low", "Israel": "Low", "Italy": "Low", "Jamaica": "Low",
        "Japan": "Low", "Jordan": "Medium", "Kazakhstan": "Medium", "Kenya": "Medium", "Kuwait": "Low",
        "Kyrgyzstan": "Medium", "Laos": "Medium", "Latvia": "Low", "Lebanon": "High", "Lesotho": "Low",
        "Liberia": "High", "Libya": "High", "Lithuania": "Low", "Luxembourg": "Low", "Madagascar": "Medium",
        "Malawi": "Medium", "Malaysia": "Medium", "Maldives": "Low", "Mali": "High", "Malta": "Low",
        "Mauritania": "High", "Mauritius": "Low", "Mexico": "Medium", "Moldova": "Medium", "Monaco": "Low",
        "Mongolia": "Medium", "Montenegro": "Low", "Morocco": "Medium", "Mozambique": "Medium", "Myanmar": "High",
        "Namibia": "Low", "Nepal": "Low", "Netherlands": "Low", "New Zealand": "Low", "Nicaragua": "Medium",
        "Niger": "High", "Nigeria": "High", "North Korea": "High", "Norway": "Low", "Oman": "Low",
        "Pakistan": "High", "Palestine": "High", "Panama": "Low", "Papua New Guinea": "Medium", "Paraguay": "Low",
        "Peru": "Medium", "Philippines": "Medium", "Poland": "Low", "Portugal": "Low", "Qatar": "Low",
        "Romania": "Low", "Russia": "High", "Rwanda": "Medium", "Saudi Arabia": "Medium", "Senegal": "Medium",
        "Serbia": "Low", "Seychelles": "Low", "Sierra Leone": "High", "Singapore": "Low", "Slovakia": "Low",
        "Slovenia": "Low", "Solomon Islands": "Medium", "Somalia": "High", "South Africa": "Medium", "South Korea": "Low",
        "South Sudan": "High", "Spain": "Low", "Sri Lanka": "Medium", "Sudan": "High", "Suriname": "Medium",
        "Sweden": "Low", "Switzerland": "Low", "Syria": "High", "Taiwan": "Low", "Tajikistan": "Medium",
        "Tanzania": "Medium", "Thailand": "Medium", "Togo": "Medium", "Tunisia": "Medium", "Turkey": "Medium",
        "Turkmenistan": "Medium", "Uganda": "Medium", "Ukraine": "Medium", "United Arab Emirates": "Low", "United Kingdom": "Low",
        "United States": "Low", "Uruguay": "Low", "Uzbekistan": "Medium", "Venezuela": "High", "Vietnam": "Medium",
        "Yemen": "High", "Zambia": "Medium", "Zimbabwe": "High"
    };

    // Populate Dropdown in Alphabetical Order
    function populateCountryDropdown() {
        const countries = Object.keys(countryRiskLevels).sort(); // Sort countries alphabetically
        destinationSelect.innerHTML = '<option value="">-- Select Country --</option>';
        countries.forEach(country => {
            const option = document.createElement("option");
            option.value = country;
            option.textContent = country;
            destinationSelect.appendChild(option);
        });
    }
    populateCountryDropdown();

    // ✅ Show Risk Indicator Below Dropdown
    destinationSelect.addEventListener("change", function () {
        const selectedCountry = destinationSelect.value;
        const riskLevel = countryRiskLevels[selectedCountry];

        if (riskLevel === "High") {
            riskIndicator.innerHTML = "🔴 <strong>High Compliance Risk:</strong> Strict checks required!";
            riskIndicator.style.color = "#b91c1c";
        } else if (riskLevel === "Medium") {
            riskIndicator.innerHTML = "🟡 <strong>Moderate Compliance Risk:</strong> Some restrictions apply.";
            riskIndicator.style.color = "#b45309";
        } else if (riskLevel === "Low") {
            riskIndicator.innerHTML = "🟢 <strong>Low Compliance Risk:</strong> Minimal compliance issues.";
            riskIndicator.style.color = "#047857";
        } else {
            riskIndicator.innerHTML = "";
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
