document.addEventListener("DOMContentLoaded", async function () {
    const totalShipments = document.getElementById("total-shipments");
    const compliantShipments = document.getElementById("compliant-shipments");
    const nonCompliantShipments = document.getElementById("noncompliant-shipments");

    try {
        const response = await fetch("https://hackathon-project-5oha.onrender.com/api/shipments");
        const shipments = await response.json();

        totalShipments.textContent = shipments.length;

        let compliant = 0, nonCompliant = 0;
        let categories = {}, destinations = {};
        let lowRisk = 0, mediumRisk = 0, highRisk = 0;

        shipments.forEach(shipment => {
            let riskLevel = calculateRiskScore(shipment.category, shipment.destination, shipment.weight);

            if (shipment.weight > 50 || ["North Korea", "Iran"].includes(shipment.destination) || 
                ["explosives", "drugs", "firearms"].includes(shipment.category.toLowerCase())) {
                nonCompliant++;
            } else {
                compliant++;
            }

            // Track Risk Levels
            if (riskLevel === "LOW") lowRisk++;
            else if (riskLevel === "MEDIUM") mediumRisk++;
            else if (riskLevel === "HIGH") highRisk++;

            // Count categories and destinations
            categories[shipment.category] = (categories[shipment.category] || 0) + 1;
            destinations[shipment.destination] = (destinations[shipment.destination] || 0) + 1;
        });

        compliantShipments.textContent = compliant;
        nonCompliantShipments.textContent = nonCompliant;

        // 📊 Risk Trends Chart
        new Chart(document.getElementById("riskChart"), {
            type: "bar",
            data: {
                labels: ["Low Risk", "Medium Risk", "High Risk"],
                datasets: [{
                    label: "Number of Shipments",
                    data: [lowRisk, mediumRisk, highRisk],
                    backgroundColor: ["#047857", "#b45309", "#b91c1c"]
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });

        // 📦 Shipment Compliance Chart
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

        // 📦 Most Shipped Categories Chart
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

        // 🌍 Top Destination Chart
        new Chart(document.getElementById("destinationChart"), {
            type: "bar",
            data: {
                labels: Object.keys(destinations),
                datasets: [{
                    label: "Top Destinations",
                    data: Object.values(destinations),
                    backgroundColor: "#F59E0B"
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

// Function to calculate risk level
function calculateRiskScore(category, destination, weight) {
    const highRiskCountries = ["Russia", "Iran", "North Korea", "Syria"];
    const mediumRiskCountries = ["China", "Brazil", "Mexico"];
    
    let riskScore = 0;
    if (highRiskCountries.includes(destination)) riskScore += 3;
    if (mediumRiskCountries.includes(destination)) riskScore += 2;
    if (["firearms", "explosives", "drugs", "alcohol"].includes(category.toLowerCase())) return "HIGH";
    if (weight > 30) riskScore += 2;
    if (weight > 10) riskScore += 1;
    return riskScore >= 4 ? "HIGH" : riskScore >= 2 ? "MEDIUM" : "LOW";
}

document.getElementById("download-pdf").addEventListener("click", async function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 📑 PDF Title & Date
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Shipment Compliance Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

    try {
        const response = await fetch("https://hackathon-project-5oha.onrender.com/api/shipments");
        const shipments = await response.json();

        if (shipments.length === 0) {
            doc.text("No shipment records available.", 20, 50);
        } else {
            let y = 50; // Start position for text

            doc.setFontSize(14);
            doc.text("Shipment Details:", 20, y);
            y += 10;

            shipments.forEach((shipment, index) => {
                let complianceStatus = (shipment.weight > 50 || ["North Korea", "Iran"].includes(shipment.destination) || 
                    ["explosives", "drugs", "firearms"].includes(shipment.category.toLowerCase())) ? "❌ Non-Compliant" : "✅ Compliant";

                doc.setFontSize(12);
                doc.text(`${index + 1}. ${shipment.productName} (${shipment.category})`, 20, y);
                doc.text(`   Destination: ${shipment.destination} | Weight: ${shipment.weight}kg`, 20, y + 5);
                doc.text(`   Compliance: ${complianceStatus}`, 20, y + 10);
                y += 20;
            });
        }

        // 📥 Save PDF
        doc.save("Shipment_Compliance_Report.pdf");

    } catch (error) {
        console.error("Error generating PDF report:", error);
    }
});
