// index.js (login)

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        return showModal("Login Failed", "Please enter both email and password.");
    }

    try {
        const userCredential = await window.auth
            .signInWithEmailAndPassword(email, password);

        const user = userCredential.user;

        // --------------------------------------------------
        // 🚫 BLOCK LOGIN IF EMAIL IS NOT VERIFIED
        // --------------------------------------------------
        if (!user.emailVerified) {
            window.auth.signOut(); 
            return showModal(
                "Email Not Verified",
                `A verification link was sent to:<br><b>${email}</b><br><br>
                 Please verify your email before logging in.`
            );
        }


        // --------------------------------------------------
        // 📌 Continue with your existing logic
        // --------------------------------------------------

        sessionStorage.setItem("uid", user.uid);

        const snapshot = await window.realtimeDB
            .ref("users/" + user.uid)
            .once("value");

        if (!snapshot.exists()) {
            return showModal("Error", "User record not found in database.");
        }

        const userData = snapshot.val();

        if (userData.tempPassword === true) {
            return (window.location.href = "/pages/reset-password.html");
        }

        if (userData.completeInfo === false) {
            return (window.location.href = "/pages/complete-form.html");
        }

        window.location.href = "https://loki-paul.github.io/BRGY-WEB-TEST-7.0/pages/home.html";

    } catch (error) {
        handleLoginError(error);
    }
});


// ------------------
// ERROR HANDLER
// ------------------
function handleLoginError(error) {
    let msg = "Invalid email or password.";

    switch (error.code) {
        case "auth/invalid-email":
            msg = "Please enter a valid email.";
            break;
        case "auth/user-not-found":
            msg = "No account found with this email.";
            break;
        case "auth/wrong-password":
            msg = "Incorrect password.";
            break;
    }

    showModal("Login Failed", msg);
}


// ------------------------------
// GOOGLE SIGN-IN = Under Construction
// ------------------------------
document.getElementById("googleSignIn").addEventListener("click", () => {
    showGlobalModal(
        "Under Construction",
        "Google Sign-In is currently under construction. Please wait for the next update."
    );
});

function showGlobalModal(title, message) {
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalMessage").innerText = message;

    const modal = document.getElementById("globalModal");
    modal.style.display = "flex";

    document.getElementById("modalCloseBtn").onclick = () => {
        modal.style.display = "none";
    };
}
