document.addEventListener("DOMContentLoaded", async function () {
    const totalShipments = document.getElementById("total-shipments");
    const compliantShipments = document.getElementById("compliant-shipments");
    const nonCompliantShipments = document.getElementById("noncompliant-shipments");

    try {
        const response = await fetch("https://hackathon-project-5oha.onrender.com/api/shipments");
        const shipments = await response.json();

        totalShipments.textContent = shipments.length;

        let compliant = 0, nonCompliant = 0;
        let categories = {};

        shipments.forEach(shipment => {
            if (shipment.weight > 50 || ["north korea", "iran"].includes(shipment.destination.toLowerCase()) || 
                ["explosives", "drugs", "firearms"].includes(shipment.category.toLowerCase())) {
                nonCompliant++;
            } else {
                compliant++;
            }

            categories[shipment.category] = (categories[shipment.category] || 0) + 1;
        });

        compliantShipments.textContent = compliant;
        nonCompliantShipments.textContent = nonCompliant;

        // Draw the Shipment Chart
        new Chart(document.getElementById("shipmentChart"), {
            type: "doughnut",
            data: {
                labels: ["Compliant Shipments", "Non-Compliant Shipments"],
                datasets: [{
                    data: [compliant, nonCompliant],
                    backgroundColor: ["#10B981", "#EF4444"]
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: "top" } }
            }
        });

        // Draw the Category Chart
        new Chart(document.getElementById("categoryChart"), {
            type: "bar",
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    label: "Most Shipped Categories",
                    data: Object.values(categories),
                    backgroundColor: "#3B82F6"
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } }
            }
        });

    } catch (error) {
        console.error("Error loading shipment data:", error);
    }
});
