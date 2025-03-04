document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const resultsDiv = document.getElementById("compliance-results");
    const historyDiv = document.getElementById("shipment-history");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append("productName", document.getElementById("product-name").value);
        formData.append("category", document.getElementById("category").value.toLowerCase());
        formData.append("destination", document.getElementById("destination").value.toLowerCase());
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
                resultsDiv.innerHTML = "✅ " + result.message;
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
});
