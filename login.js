
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberCheckbox = document.getElementById("remember");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
    }

    // Demo only: no real authentication is performed.
    alert("Login form validated successfully! Connect your backend to sign in.");

    console.log("Email:", email);
    console.log("Remember me:", rememberCheckbox.checked);
});

// Forgot Password
document.getElementById("forgotPassword").addEventListener("click", function (event) {
    event.preventDefault();
    alert("Password reset functionality will be added soon.");
});

// Sign Up
document.getElementById("signupLink").addEventListener("click", function (event) {
    event.preventDefault();
    alert("Sign-up functionality will be added soon.");
});
