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

            // Compliance check
            if (["North Korea", "Iran"].includes(shipment.destination) || 
                ["explosives", "drugs", "firearms"].includes(shipment.category.toLowerCase())) {
                nonCompliant++;
            } else {
                compliant++;
            }

            // Risk Level Classification
            if (riskLevel === "LOW") lowRisk++;
            else if (riskLevel === "MEDIUM") mediumRisk++;
            else if (riskLevel === "HIGH") highRisk++;

            // Count categories and destinations
            categories[shipment.category] = (categories[shipment.category] || 0) + 1;
            destinations[shipment.destination] = (destinations[shipment.destination] || 0) + 1;
        });

        // Update HTML counters
        compliantShipments.textContent = compliant;
        nonCompliantShipments.textContent = nonCompliant;

        // 📊 Generate Charts
        generateChart("riskChart", "bar", ["Low Risk", "Medium Risk", "High Risk"], 
            [lowRisk, mediumRisk, highRisk], ["#047857", "#b45309", "#b91c1c"], "Number of Shipments");

        generateChart("shipmentChart", "doughnut", ["Compliant Shipments", "Non-Compliant Shipments"], 
            [compliant, nonCompliant], ["#10B981", "#EF4444"]);

        generateChart("categoryChart", "bar", Object.keys(categories), Object.values(categories), "#3B82F6", "Most Shipped Categories");

        generateChart("destinationChart", "bar", Object.keys(destinations), Object.values(destinations), "#F59E0B", "Top Destinations");

    } catch (error) {
        console.error("Error loading shipment data:", error);
    }
});

// 📊 Function to Generate Charts Dynamically
function generateChart(canvasId, type, labels, data, colors, labelText = "") {
    
    
    
    const ctx = document.getElementById(canvasId).getContext("2d");
    new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: labelText,
                data: data,
                backgroundColor: Array.isArray(colors) ? colors : [colors]
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: "top" } },
            scales: type === "bar" ? { y: { beginAtZero: true } } : {}
        }
    });
}

// 🚨 Compliance & Risk Level Calculation
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

// 📥 Generate PDF Report
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
