document.addEventListener("DOMContentLoaded", function() {
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference or use the system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        document.documentElement.classList.add('dark');
    }
    
    function toggleTheme() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    
    themeToggle.addEventListener('click', toggleTheme);
    mobileThemeToggle.addEventListener('click', toggleTheme);
    
    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuToggle.addEventListener('click', function() {
        mobileMenu.classList.toggle('open');
    });
    
    // Tab Switching
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current button and content
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Toast Notification
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toast-title');
    const toastDescription = document.getElementById('toast-description');
    const toastClose = document.getElementById('toast-close');
    
    function showToast(title, description, type = 'default') {
        toastTitle.textContent = title;
        toastDescription.textContent = description;
        
        // Set toast type (default, success, error)
        toast.className = 'toast show';
        if (type === 'success') {
            toast.classList.add('toast-success');
        } else if (type === 'error') {
            toast.classList.add('toast-error');
        }
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            hideToast();
        }, 5000);
    }
    
    function hideToast() {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.className = 'toast';
        }, 300);
    }
    
    toastClose.addEventListener('click', hideToast);
    
    // Fetch Shipment Data and Update UI
    async function fetchShipmentData() {
        try {
            // Show skeletons
            document.getElementById('total-shipments-skeleton').classList.remove('hidden');
            document.getElementById('compliant-shipments-skeleton').classList.remove('hidden');
            document.getElementById('noncompliant-shipments-skeleton').classList.remove('hidden');
            document.getElementById('compliance-chart-skeleton').classList.remove('hidden');
            document.getElementById('destinations-chart-skeleton').classList.remove('hidden');
            document.getElementById('risk-chart-skeleton').classList.remove('hidden');
            
            // Hide values
            document.getElementById('total-shipments').classList.add('hidden');
            document.getElementById('compliant-shipments').classList.add('hidden');
            document.getElementById('noncompliant-shipments').classList.add('hidden');
            
            const response = await fetch("https://hackathon-project-5oha.onrender.com/api/shipments");
            
            if (!response.ok) {
                throw new Error("Failed to fetch shipment data");
            }
            
            const shipments = await response.json();
            
            // Process data
            let compliant = 0, nonCompliant = 0;
            let destinations = {};
            let lowRisk = 0, mediumRisk = 0, highRisk = 0;
            
            shipments.forEach(shipment => {
                // Compliance check
                if (
                    ["North Korea", "Iran"].includes(shipment.destination) || 
                    ["explosives", "drugs", "firearms"].includes(shipment.category.toLowerCase())
                ) {
                    nonCompliant++;
                } else {
                    compliant++;
                }
                
                // Risk Level Classification
                const riskLevel = calculateRiskScore(shipment.category, shipment.destination, shipment.weight);
                if (riskLevel === "LOW") lowRisk++;
                else if (riskLevel === "MEDIUM") mediumRisk++;
                else if (riskLevel === "HIGH") highRisk++;
                
                // Count destinations
                destinations[shipment.destination] = (destinations[shipment.destination] || 0) + 1;
            });
            
            // Update stats
            document.getElementById('total-shipments').textContent = shipments.length;
            document.getElementById('compliant-shipments').textContent = compliant;
            document.getElementById('noncompliant-shipments').textContent = nonCompliant;
            
            // Hide skeletons
            document.getElementById('total-shipments-skeleton').classList.add('hidden');
            document.getElementById('compliant-shipments-skeleton').classList.add('hidden');
            document.getElementById('noncompliant-shipments-skeleton').classList.add('hidden');
            
            // Show values
            document.getElementById('total-shipments').classList.remove('hidden');
            document.getElementById('compliant-shipments').classList.remove('hidden');
            document.getElementById('noncompliant-shipments').classList.remove('hidden');
            
            // Generate Charts
            generateComplianceChart(compliant, nonCompliant);
            generateDestinationsChart(destinations);
            generateRiskChart(lowRisk, mediumRisk, highRisk);
            
        } catch (error) {
            console.error("Error fetching shipment data:", error);
            showToast("Error", "Failed to load shipment data. Please try again later.", "error");
        }
    }
    
    // Risk calculation function
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
    
    // Generate Compliance Chart
    function generateComplianceChart(compliant, nonCompliant) {
        const ctx = document.getElementById('shipmentChart').getContext('2d');
        document.getElementById('compliance-chart-skeleton').classList.add('hidden');
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Compliant Shipments', 'Non-Compliant Shipments'],
                datasets: [{
                    data: [compliant, nonCompliant],
                    backgroundColor: ['#10B981', '#EF4444'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Generate Destinations Chart
    function generateDestinationsChart(destinations) {
        const ctx = document.getElementById('destinationChart').getContext('2d');
        document.getElementById('destinations-chart-skeleton').classList.add('hidden');
        
        // Convert destinations object to sorted array
        const sortedDestinations = Object.entries(destinations)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5 destinations
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedDestinations.map(d => d.name),
                datasets: [{
                    label: 'Shipments',
                    data: sortedDestinations.map(d => d.value),
                    backgroundColor: '#F59E0B',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Generate Risk Chart
    function generateRiskChart(lowRisk, mediumRisk, highRisk) {
        const ctx = document.getElementById('riskChart').getContext('2d');
        document.getElementById('risk-chart-skeleton').classList.add('hidden');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Low Risk', 'Medium Risk', 'High Risk'],
                datasets: [{
                    label: 'Shipments',
                    data: [lowRisk, mediumRisk, highRisk],
                    backgroundColor: ['#047857', '#b45309', '#b91c1c'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // PDF Generation
    const downloadPdfButton = document.getElementById('download-pdf');
    
    downloadPdfButton.addEventListener('click', async function() {
        try {
            // Show loading state
            const originalButtonText = this.innerHTML;
            this.innerHTML = `
                <span class="spinner"></span>
                Generating PDF...
            `;
            this.disabled = true;
            
            // Load jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // PDF Title & Date
            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.text("Shipment Compliance Report", 20, 20);
            doc.setFontSize(12);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
            
            try {
                const response = await fetch("https://hackathon-project-5oha.onrender.com/api/shipments");
                
                if (!response.ok) {
                    throw new Error("Failed to fetch shipment data");
                }
                
                const shipments = await response.json();
                
                if (shipments.length === 0) {
                    doc.text("No shipment records available.", 20, 50);
                } else {
                    let y = 50; // Start position for text
                    
                    doc.setFontSize(14);
                    doc.text("Shipment Details:", 20, y);
                    y += 10;
                    
                    shipments.forEach((shipment, index) => {
                        let complianceStatus = (
                            shipment.weight > 50 || 
                            ["North Korea", "Iran"].includes(shipment.destination) || 
                            ["explosives", "drugs", "firearms"].includes(shipment.category.toLowerCase())
                        ) ? "❌ Non-Compliant" : "✅ Compliant";
                        
                        doc.setFontSize(12);
                        doc.text(`${index + 1}. ${shipment.productName} (${shipment.category})`, 20, y);
                        doc.text(`   Destination: ${shipment.destination} | Weight: ${shipment.weight}kg`, 20, y + 5);
                        doc.text(`  https://qrfy.io/b_dyV5B9qd`, 20, y + 10);
                        doc.text(`   Compliance: ${complianceStatus}`, 20, y + 15);
                        y += 20;
                        
                        // Add new page if needed
                        if (y > 270) {
                            doc.addPage();
                            y = 20;
                        }
                    });
                }
                
                // Save PDF
                doc.save("Shipment_Compliance_Report.pdf");
                
                showToast("Success", "PDF report has been generated and downloaded.", "success");
            } catch (error) {
                console.error("Error generating PDF report:", error);
                showToast("Error", "Failed to generate PDF report. Please try again.", "error");
            }
        } catch (error) {
            console.error("Error loading jsPDF:", error);
            showToast("Error", "Failed to load PDF generator. Please try again.", "error");
        } finally {
            // Restore button state
            this.innerHTML = originalButtonText;
            this.disabled = false;
        }
    });
    
    // Initialize the dashboard
    fetchShipmentData();
});
