async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:10000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user)); // Store user session
        window.location.href = "index.html"; // Redirect to Compliance Checker
    } else {
        document.getElementById("message").innerText = data.message;
    }
}


async function signup() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("signup-email").value;
    let password = document.getElementById("signup-password").value;

    let response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });

    let data = await response.json();
    document.getElementById("signup-message").innerText = data.message;

    if (response.ok) {
        alert("Signup successful! Please login.");
        toggleForm();
    }
}

function toggleForm() {
    document.querySelector(".auth-box").classList.toggle("hidden");
    document.getElementById("signup-box").classList.toggle("hidden");
}
