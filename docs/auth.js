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
    const message = document.getElementById("message");

    try {
        const response = await fetch("https://hackathon-project-5oha.onrender.com/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            message.innerText = "✅ Login Successful! Redirecting...";
            setTimeout(() => {
                window.location.href = "index.html"; 
            }, 1500);
        } else {
            message.innerText = "❌ " + data.message;
        }
    } catch (error) {
        message.innerText = "❌ Server Error. Please try again.";
    }
}

async function signup() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const signupMessage = document.getElementById("signup-message");

    try {
        const response = await fetch("https://hackathon-project-5oha.onrender.com/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            signupMessage.innerText = "✅ Signup Successful! Redirecting...";
            setTimeout(() => {
                toggleForm(); 
            }, 1500);
        } else {
            signupMessage.innerText = "❌ " + data.message;
        }
    } catch (error) {
        signupMessage.innerText = "❌ Server Error. Please try again.";
    }
}
