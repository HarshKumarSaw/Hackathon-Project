document.addEventListener("DOMContentLoaded", async function () {
    const totalShipments = document.getElementById("total-shipments");
    const compliantShipments = document.getElementById("compliant-shipments");
    const nonCompliantShipments = document.getElementById("noncompliant-shipments");
    const topDestinations = document.getElementById("top-destinations");
    const topCategories = document.getElementById("top-categories");

    try {
        const response = await fetch("https://hackathon-project-5oha.onrender.com/api/shipments");
        const shipments = await response.json();

        totalShipments.textContent = shipments.length;

        let compliant = 0, nonCompliant = 0;
        let destinations = {}, categories = {};

        shipments.forEach(shipment => {
            if (shipment.weight > 50 || ["north korea", "iran"].includes(shipment.destination.toLowerCase()) || 
                ["explosives", "drugs", "firearms"].includes(shipment.category.toLowerCase())) {
                nonCompliant++;
            } else {
                compliant++;
            }

            destinations[shipment.destination] = (destinations[shipment.destination] || 0) + 1;
            categories[shipment.category] = (categories[shipment.category] || 0) + 1;
        });

        compliantShipments.textContent = compliant;
        nonCompliantShipments.textContent = nonCompliant;

        topDestinations.textContent = Object.entries(destinations)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(d => `${d[0]} (${d[1]})`)
            .join(", ") || "No shipments yet";

        topCategories.textContent = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(c => `${c[0]} (${c[1]})`)
            .join(", ") || "No shipments yet";

    } catch (error) {
        console.error("Error fetching shipment data:", error);
    }
});
