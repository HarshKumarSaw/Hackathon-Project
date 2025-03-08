function toggleForm() {
    const loginBox = document.getElementById("login-box");
    const signupBox = document.getElementById("signup-box");

    // Toggle visibility
    loginBox.classList.toggle("hidden");
    signupBox.classList.toggle("hidden");
}
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:10000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Login successful!");
            window.location.href = "dashboard.html"; // ✅ Redirect after successful login
        } else {
            document.getElementById("message").innerText = data.message || "Login failed!";
        }
    } catch (error) {
        document.getElementById("message").innerText = "Error connecting to server!";
    }
}

async function signup() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const signupMessage = document.getElementById("signup-message");

    try {
        const response = await fetch("http://localhost:10000/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            signupMessage.innerText = "✅ Signup Successful! Redirecting...";
            setTimeout(() => {
                toggleForm(); // Switch to login form
            }, 1500);
        } else {
            signupMessage.innerText = "❌ " + data.message;
        }
    } catch (error) {
        signupMessage.innerText = "❌ Server Error. Please try again.";
    }
}

function logout() {
    fetch("/api/logout", { method: "POST" })
        .then(response => response.json())
        .then(() => {
            window.location.href = "auth.html"; // Redirect to login page
        });
}

function checkAuth() {
    fetch("/api/user-session")
        .then(response => response.json())
        .then(data => {
            if (!data.user) {
                window.location.href = "auth.html"; // Redirect to login page
            }
        });
}

// Call this function on compliance checker pages
if (window.location.pathname.includes("compliance")) {
    checkAuth();
}
