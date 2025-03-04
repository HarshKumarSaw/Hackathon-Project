// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevents page refresh on form submission

        // Get form values
        const productName = document.getElementById("product-name").value;
        const category = document.getElementById("category").value;
        const destination = document.getElementById("destination").value;
        const weight = document.getElementById("weight").value;
        const invoice = document.getElementById("invoice").files[0];

        // Basic validation
        if (!productName || !category || !destination || !weight || !invoice) {
            alert("Please fill in all fields and upload an invoice.");
            return;
        }

        // Display entered data in the console (simulating a backend request)
        console.log("Shipment Details:");
        console.log("Product Name:", productName);
        console.log("Category:", category);
        console.log("Destination:", destination);
        console.log("Weight:", weight);
        console.log("Invoice Uploaded:", invoice.name);

        // Simulate success message (later, we will send this to a backend)
        alert("Shipment details submitted successfully! (Next: Compliance Check)");
    });
});
