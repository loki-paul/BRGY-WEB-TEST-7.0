/* sendOtp.js */

const actionCodeSettings = {
    url: window.location.origin + "/verifyOtp.html",
    handleCodeInApp: true
};

document.getElementById("sendLinkForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();

    if (!email) return alert("Enter an email");

    try {
        await auth.sendSignInLinkToEmail(email, actionCodeSettings);

        // temporarily store email
        localStorage.setItem("signup_email", email);

        alert("Verification link sent! Check your inbox.");
    } catch (err) {
        alert(err.message);
    }
});
