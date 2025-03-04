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

        resultsDiv.innerHTML = "";
        resultsDiv.className = "";

        if (!productName || !category || !destination || !weight) {
            resultsDiv.className = "red";
            resultsDiv.innerHTML = "⚠️ Please fill in all fields.";
            return;
        }

        try {
            const response = await fetch("https://hackathon-project-5oha.onrender.com/api/submit-shipment", {
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
