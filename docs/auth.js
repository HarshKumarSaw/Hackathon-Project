const SERVER_URL = "https://hackathon-project-5oha.onrender.com/api"; // Your server URL

async function signup() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${SERVER_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    document.getElementById("message").innerText = data.message;
}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${SERVER_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    document.getElementById("message").innerText = data.message;

    if (response.ok) {
        localStorage.setItem("token", data.token); // Store token
        window.location.href = "dashboard.html"; // Redirect to dashboard
    }
}

// Redirect to dashboard if already logged in
if (localStorage.getItem("token")) {
    window.location.href = "dashboard.html";
}

// Logout Function
function logout() {
    localStorage.removeItem("token");
    window.location.href = "auth.html";
}
