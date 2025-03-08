document.addEventListener("DOMContentLoaded", function () {
    const chatbotToggle = document.getElementById("chatbot-toggle");
    const chatbotContainer = document.getElementById("chatbot-container");
    const closeChatbot = document.getElementById("close-chatbot");
    const chatbotMessages = document.getElementById("chatbot-messages");
    const chatbotInput = document.getElementById("chatbot-input");
    const sendChatbot = document.getElementById("send-chatbot");

    const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"; // Replace with your actual key

    // 🔹 Show/Hide Chatbot
    chatbotToggle.addEventListener("click", () => chatbotContainer.style.display = "flex");
    closeChatbot.addEventListener("click", () => chatbotContainer.style.display = "none");

    // 🔹 Send Message
    sendChatbot.addEventListener("click", async () => {
        let userMessage = chatbotInput.value.trim();
        if (!userMessage) return;

        // Display User Message
        chatbotMessages.innerHTML += `<div><strong>You:</strong> ${userMessage}</div>`;
        chatbotInput.value = "";

        // Call ChatGPT API
        try {
            let response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "system", content: "You are a helpful trade compliance assistant." }, 
                               { role: "user", content: userMessage }]
                })
            });

            let data = await response.json();
            let aiResponse = data.choices[0].message.content;

            // Display AI Response
            chatbotMessages.innerHTML += `<div><strong>AI:</strong> ${aiResponse}</div>`;
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight; // Auto-scroll
        } catch (error) {
            chatbotMessages.innerHTML += `<div><strong>AI:</strong> ❌ Error fetching response.</div>`;
            console.error("Chatbot Error:", error);
        }
    });

        // 📂 Show Selected CSV File Name
    document.getElementById("csv-upload").addEventListener("change", function () {
        const fileName = this.files.length > 0 ? this.files[0].name : "No file selected";
        document.getElementById("csv-upload-status").textContent = fileName;
    });

        // 📂 Read CSV File & Fill Form
    document.getElementById("csv-upload").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const csvContent = e.target.result;
        const rows = csvContent.split("\n").map(row => row.split(",")); // Convert CSV to array

        if (rows.length < 2) {
            alert("⚠️ Invalid CSV format.");
            return;
        }

        // Extract headers and first row of data
        const headers = rows[0].map(h => h.trim().toLowerCase());
        const values = rows[1].map(v => v.trim());

        // Map CSV values to form fields
        const fieldMapping = {
            "exportername": "exporter-name",
            "exporteraddress": "exporter-address",
            "importername": "importer-name",
            "importercountry": "importer-country",
            "importertaxid": "importer-tax-id",
            "productname": "product-name",
            "category": "category",
            "destination": "destination",
            "weight": "weight",
            "quantity": "quantity",
            "shipmentvalue": "shipment-value",
            "modeoftransport": "mode-of-transport"
        };

        headers.forEach((header, index) => {
            if (fieldMapping[header]) {
                document.getElementById(fieldMapping[header]).value = values[index] || "";
            }
        });
    };

    reader.readAsText(file); // Read CSV file
});



    // Allow Enter Key Submission
    chatbotInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") sendChatbot.click();
    });
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
        "Turkmenistan": "Medium", "Uganda": "Medium", "Ukraine": "High", "United Arab Emirates": "Low", "United Kingdom": "Low",
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
        fetchTariff(categorySelect.value, destinationSelect.value);
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

    const categorySelect = document.getElementById("category");
    const categoryRiskIndicator = document.getElementById("category-risk");
    const tariffDisplay = document.createElement("p");
    tariffDisplay.id = "tariff-display";
    tariffDisplay.style.fontWeight = "bold";
    tariffDisplay.style.color = "#1e3a8a";
    tariffDisplay.style.marginTop = "10px";
    categorySelect.insertAdjacentElement("afterend", tariffDisplay);

// 🌍 Full International Trade Categories with Risk Levels
    const categoryRiskLevels = {
        "Live Animals & Animal Products": "Medium", "Vegetable Products": "Low", "Foodstuffs": "Low",
        "Mineral Products": "Medium", "Chemical & Pharmaceutical Products": "High", "Plastics & Rubber": "Medium",
        "Leather & Fur": "Low", "Wood & Paper Products": "Low", "Textiles & Clothing": "Medium",
        "Footwear, Headgear, Umbrellas": "Medium", "Stone, Glass, & Ceramics": "Low", "Metals & Metal Products": "Medium",
        "Machinery & Electrical Equipment": "Medium", "Transport Vehicles": "Medium", "Optical, Medical Instruments": "Medium",
        "Arms & Ammunition": "High", "Miscellaneous Manufactured Articles": "Low", "Art, Collectibles, & Antiques": "Low",
        "Special Transactions": "High", "Energy & Environmental Goods": "Medium", "Unclassified Trade Goods": "Medium"
};
    // HS Code Mapping for Each Category
    const categoryHSCodeMap = {
        "Live Animals & Animal Products": "0101",
        "Vegetable Products": "0701",
        "Foodstuffs": "2106",
        "Mineral Products": "2501",
        "Chemical & Pharmaceutical Products": "3001",
        "Plastics & Rubber": "3901",
        "Leather & Fur": "4101",
        "Wood & Paper Products": "4801",
        "Textiles & Clothing": "6201",
        "Footwear, Headgear, Umbrellas": "6401",
        "Stone, Glass, & Ceramics": "6801",
        "Metals & Metal Products": "7201",
        "Machinery & Electrical Equipment": "8401",
        "Transport Vehicles": "8701",
        "Optical, Medical Instruments": "9001",
        "Arms & Ammunition": "9301",
        "Miscellaneous Manufactured Articles": "9601",
        "Art, Collectibles, & Antiques": "9701",
        "Special Transactions": "9801",
        "Energy & Environmental Goods": "9901",
        "Unclassified Trade Goods": "9999"
    };

// ✅ Populate Category Dropdown Alphabetically
    function populateCategoryDropdown() {
        categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
        Object.keys(categoryRiskLevels).sort().forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
    });
// Auto-fill HS Code when Category is Selected
    document.getElementById("category").addEventListener("change", function () {
        const selectedCategory = this.value;
        const hsCodeInput = document.getElementById("hs-code");
        hsCodeInput.value = categoryHSCodeMap[selectedCategory] || ""; // Fill or keep empty if not found
});
}
    populateCategoryDropdown();

// ✅ Show Risk Indicator Below Dropdown
    categorySelect.addEventListener("change", function () {
        fetchTariff(categorySelect.value, destinationSelect.value);
        const selectedCategory = categorySelect.value;
        const riskLevel = categoryRiskLevels[selectedCategory];
        
        if (riskLevel === "High") {
            categoryRiskIndicator.innerHTML = "🔴 <strong>High Risk:</strong> Requires strict regulations and approval.";
            categoryRiskIndicator.style.color = "#b91c1c";
        } else if (riskLevel === "Medium") {
            categoryRiskIndicator.innerHTML = "🟡 <strong>Medium Risk:</strong> Some restrictions apply, check compliance.";
            categoryRiskIndicator.style.color = "#b45309";
        } else if (riskLevel === "Low") {
            categoryRiskIndicator.innerHTML = "🟢 <strong>Low Risk:</strong> Minimal compliance issues.";
            categoryRiskIndicator.style.color = "#047857";
        } else {
            categoryRiskIndicator.innerHTML = "";
    }
});
// Show Export License Field Only If Required
    document.getElementById("category").addEventListener("change", function () {
        const selectedCategory = this.value;
        const exportLicenseSection = document.getElementById("export-license-section");
        
        if (categoryRiskLevels[selectedCategory] === "High") {
        exportLicenseSection.style.display = "block"; // Show field
        } else {
        exportLicenseSection.style.display = "none";  // Hide field
        }
});

    // 🛠 Ensure Form Submission Works
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData();
        // ✅ Add Exporter Details
        formData.append("exporterName", document.getElementById("exporter-name").value);
        formData.append("exporterAddress", document.getElementById("exporter-address").value);
        // ✅ Add Importer Details
        formData.append("importerName", document.getElementById("importer-name").value);
        formData.append("destination", destinationSelect.value);
        // ✅ Add Product Details
        formData.append("productName", document.getElementById("product-name").value);
        formData.append("category", document.getElementById("category").value);
        formData.append("hsCode", document.getElementById("hs-code").value);
        formData.append("quantity", document.getElementById("quantity").value);
        // ✅ Add Shipment Details
        formData.append("shipmentValue", document.getElementById("shipment-value").value);
        formData.append("weight", document.getElementById("weight").value);
        formData.append("modeOfTransport", document.getElementById("mode-of-transport").value);
        // ✅ Add Tax Details
        formData.append("tariffRate", document.getElementById("tariff-info").innerText);
        formData.append("additionalTaxes", document.getElementById("additional-tax").innerText);
        formData.append("totalImportTax", document.getElementById("total-tax").innerText);
        // ✅ Add Export License (Only if required)
        const exportLicenseField = document.getElementById("export-license");
        formData.append("exportLicense", exportLicenseField ? exportLicenseField.value : "Not Required");
        // ✅ Add Invoice File
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

    document.getElementById("upload-csv").addEventListener("click", async function () {
    const fileInput = document.getElementById("csv-upload");
    if (!fileInput.files.length) {
        alert("Please select a CSV file to upload.");
        return;
    }

    const formData = new FormData();
    formData.append("csv", fileInput.files[0]);

    try {
        const response = await fetch("https://hackathon-project-5oha.onrender.com/api/upload-csv", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        document.getElementById("upload-message").innerText = result.message;

        if (response.ok) {
            alert("CSV uploaded successfully!");
            location.reload(); // Refresh to update shipment history
        }
    } catch (error) {
        console.error("Error uploading CSV:", error);
        document.getElementById("upload-message").innerText = "❌ Error uploading CSV.";
    }
});

    loadShipmentHistory();

    async function fetchTariff(category, destination) {
        if (!category || !destination) return; // Skip if selection is empty
        try {
            const response = await fetch("https://hackathon-project-5oha.onrender.com/api/tariffs");
            const tariffData = await response.json();
            // Check if tariff data exists for the selected category & country
            if (tariffData[destination] && tariffData[destination][category]) {
                const tariffRate = tariffData[destination][category]; // Get base tariff %
                // ✅ Determine Country Risk Level (Low = 1, Medium = 2, High = 3)
                let countryRisk = 1; // Default to Low
                if (countryRiskLevels[destination] === "Medium") countryRisk = 2;
                if (countryRiskLevels[destination] === "High") countryRisk = 3;
                // ✅ Determine Category Risk Level (Low = 1, Medium = 2, High = 3)
                let categoryRisk = 1; // Default to Low
                if (categoryRiskLevels[category] === "Medium") categoryRisk = 2;
                if (categoryRiskLevels[category] === "High") categoryRisk = 3;
                const totalRiskScore = countryRisk + categoryRisk; // **Total Risk Score (2 to 6)**
                // ✅ Define Tax Multiplier Based on Total Risk Score
                const taxMultipliers = {
                2: 1.5, // Low-Low
                3: 1.8, // Low-Medium or Medium-Low
                4: 2.2, // Medium-Medium or Low-High
                5: 2.8, // Medium-High or High-Medium
                6: 3.5   // High-High
                    };
                const taxMultiplier = taxMultipliers[totalRiskScore] || 1.0; // Default to 1.0 if unexpected
                
                // ✅ Calculate Total Import Tax
                const totalImportTax = (tariffRate * taxMultiplier).toFixed(2); // Keep 2 decimal places
                const addTax = (totalImportTax - tariffRate).toFixed(2);
                
                // ✅ Display Total Tax with Explanation
                document.getElementById("tariff-info").innerHTML = `${tariffRate}%`;
                document.getElementById("additional-tax").innerHTML = `${addTax}%`; // New field for additional taxes
                document.getElementById("total-tax").innerHTML = `${totalImportTax}%`;
            } else {
                tariffDisplay.innerHTML = "⚠️ No tax data available for this selection.";
            }
        } catch (error) {
            console.error("Error fetching tariff data:", error);
            tariffDisplay.innerHTML = "❌ Error loading tax data.";
        }
    }

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
