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
        destinationSelect.innerHTML = '<option value="">-- Select Country --</option>';
        allCountries.forEach(country => {
            const option = document.createElement("option");
            option.value = country;
            option.textContent = country;
            destinationSelect.appendChild(option);
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
                resultsDiv.innerHTML = `✅ ${result.message} <br> ${riskMessage}`;
                loadShipmentHistory();
            }
        } catch (error) {
            resultsDiv.className = "red";
            resultsDiv.innerHTML = "❌ Error connecting to the server. Please try again later.";
            console.error("Backend Error:", error);
        }
    });

    // Load Shipment History (with Edit & Delete Buttons)
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
                    <button class="edit-btn" onclick="editShipment('${shipment.id}')">✏️ Edit</button>
                    <button class="delete-btn" onclick="deleteShipment('${shipment.id}')">🗑️ Delete</button>
                    <hr>
                `;
                historyDiv.appendChild(shipmentEntry);
            });
        } catch (error) {
            console.error("Error loading shipment history:", error);
        }
    }

    loadShipmentHistory(); // Load history on page load

    // 📝 Edit Shipment
    async function editShipment(shipmentId) {
        const newProductName = prompt("Enter new product name:");
        const newCategory = prompt("Enter new category:");
        const newDestination = prompt("Enter new destination:");
        const newWeight = prompt("Enter new weight (kg):");

        if (newProductName && newCategory && newDestination && newWeight) {
            try {
                const response = await fetch(`https://hackathon-project-5oha.onrender.com/api/shipments/${shipmentId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productName: newProductName,
                        category: newCategory,
                        destination: newDestination,
                        weight: parseFloat(newWeight)
                    })
                });

                if (response.ok) {
                    alert("Shipment updated successfully!");
                    loadShipmentHistory();
                } else {
                    alert("Failed to update shipment.");
                }
            } catch (error) {
                console.error("Error updating shipment:", error);
            }
        }
    }

    // ❌ Delete Shipment
    async function deleteShipment(shipmentId) {
        if (confirm("Are you sure you want to delete this shipment?")) {
            try {
                const response = await fetch(`https://hackathon-project-5oha.onrender.com/api/shipments/${shipmentId}`, {
                    method: "DELETE"
                });

                if (response.ok) {
                    alert("Shipment deleted successfully!");
                    loadShipmentHistory();
                } else {
                    alert("Failed to delete shipment.");
                }
            } catch (error) {
                console.error("Error deleting shipment:", error);
            }
        }
    }

    // 📊 Function to Generate Risk Analytics Chart
    function generateRiskChart(shipments) {
        let lowRisk = 0, mediumRisk = 0, highRisk = 0;

        shipments.forEach(shipment => {
            let riskLevel = calculateRiskScore(shipment.category, shipment.destination, shipment.weight);
            if (riskLevel === "LOW") lowRisk++;
            else if (riskLevel === "MEDIUM") mediumRisk++;
            else if (riskLevel === "HIGH") highRisk++;
        });

        const ctx = document.getElementById("riskChart").getContext("2d");

        if (window.riskChart) {
            window.riskChart.destroy();
        }

        window.riskChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Low Risk", "Medium Risk", "High Risk"],
                datasets: [{
                    label: "Number of Shipments",
                    data: [lowRisk, mediumRisk, highRisk],
                    backgroundColor: ["#047857", "#b45309", "#b91c1c"]
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }

    // Show selected file name
    document.getElementById("invoice").addEventListener("change", function () {
        document.getElementById("file-name").textContent = this.files.length > 0 ? this.files[0].name : "No file chosen";
    });
});
