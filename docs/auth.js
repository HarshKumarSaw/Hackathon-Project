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
     const messageElement = document.getElementById("message");
 
     if (!email || !password) {
         messageElement.innerText = "⚠️ Please enter both email and password.";
         return;
     }
 
     try {
         const response = await fetch("http://localhost:10000/api/login", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ email, password })
             body: JSON.stringify({ email, password }),
             credentials: "include", // Allows session cookies
         });
 
         const data = await response.json();
 
         if (response.ok) {
             message.innerText = "✅ Login Successful! Redirecting...";
             messageElement.innerText = "✅ Login successful! Redirecting...";
             setTimeout(() => {
                 window.location.href = "index.html"; 
             }, 1500);
                 window.location.href = "dashboard.html"; // Redirect to the dashboard
             }, 1000);
         } else {
             message.innerText = "❌ " + data.message;
             messageElement.innerText = `❌ ${data.message}`;
         }
     } catch (error) {
         message.innerText = "❌ Server Error. Please try again.";
         messageElement.innerText = "⚠️ Error connecting to the server.";
         console.error("Login error:", error);
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
                 toggleForm(); 
             }, 1500);
         } else {
             signupMessage.innerText = "❌ " + data.message;
         }
     } catch (error) {
         signupMessage.innerText = "❌ Server Error. Please try again.";
     }
 }
