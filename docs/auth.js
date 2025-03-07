const SERVER_URL = "https://hackathon-project-5oha.onrender.com/api"; // Your server URL

// ✅ User Signup
async function signup() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${SERVER_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    document.getElementById("message").innerText = data.message;
}

// ✅ User Login
async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${SERVER_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    document.getElementById("message").innerText = data.message;

    if (response.ok) {
        localStorage.setItem("token", data.token); // Store token
        window.location.href = "dashboard.html"; // Redirect to dashboard
    }
}

// ✅ Redirect to Dashboard if Already Logged In
if (localStorage.getItem("token")) {
    window.location.href = "dashboard.html";
}

// ✅ Logout Function
function logout() {
    localStorage.removeItem("token");
    window.location.href = "auth.html";
}
