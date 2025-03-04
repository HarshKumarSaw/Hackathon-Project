document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const productName = document.getElementById("product-name").value;
        const category = document.getElementById("category").value;
        const destination = document.getElementById("destination").value;
        const weight = document.getElementById("weight").value;

        if (!productName || !category || !destination || !weight) {
            alert("Please fill in all fields.");
            return;
        }

        const shipmentData = {
            productName,
            category,
            destination,
            weight
        };

        try {
            const response = await fetch("http://localhost:5000/api/submit-shipment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(shipmentData)
            });

            const result = await response.json();
            alert(result.message);
            console.log("Server Response:", result);
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to submit shipment details.");
        }
    });
});
