/* verifyOtp.js — REALTIME DATABASE VERSION */

function showLoading(show) {
    document.getElementById("loading").style.display = show ? "flex" : "none";
}

function showModal(title, message, callback = null) {
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalMessage").innerText = message;
    document.getElementById("modal").style.display = "flex";

    document.getElementById("modalBtn").onclick = () => {
        document.getElementById("modal").style.display = "none";
        if (callback) callback();
    };
}

window.addEventListener("load", async () => {
    const url = window.location.href;
    showLoading(true);

    try {
        if (auth.isSignInWithEmailLink(url)) {

            let email = localStorage.getItem("signup_email");
            if (!email) {
                email = prompt("Enter the email you used to sign up:");
            }

            await auth.signInWithEmailLink(email, url);
            showLoading(false);

            // Show username/password form
            document.getElementById("status").style.display = "none";
            document.getElementById("completeForm").style.display = "block";

            document.getElementById("completeForm").addEventListener("submit", async (e) => {
                e.preventDefault();
                showLoading(true);

                const username = document.getElementById("username").value.trim();
                const password = document.getElementById("password").value;

                if (!username || !password) {
                    showLoading(false);
                    return showModal("Missing Fields", "Please fill out all fields.");
                }

                const user = auth.currentUser;

                /* 🔍 CHECK IF USERNAME EXISTS IN REALTIME DATABASE */
                const usernameExists = await db
                    .ref("users")
                    .orderByChild("username")
                    .equalTo(username)
                    .once("value");

                if (usernameExists.exists()) {
                    showLoading(false);
                    return showModal("Username Taken", "Please choose another username.");
                }

                /* 🔗 Link email/password provider */
                const credential = firebase.auth.EmailAuthProvider.credential(
                    user.email,
                    password
                );

                try {
                    await user.linkWithCredential(credential);
                } catch (err) {
                    if (err.code === "auth/provider-already-linked") {
                        console.log("Provider already linked — continuing.");
                    } else {
                        showLoading(false);
                        return showModal("Error", err.message);
                    }
                }

                /* 💾 SAVE USER DATA TO REALTIME DATABASE */
                await db.ref("users/" + user.uid).set({
                    uid: user.uid,
                    username: username,
                    email: user.email,
                    createdAt: new Date().toISOString(),
                });

                localStorage.removeItem("signup_email");

                showLoading(false);
                showModal("Success!", "Your account has been created.", () => {
                    window.location.href = "index.html";
                });
            });

        } else {
            showLoading(false);
            showModal("Invalid Link", "This verification link is expired or invalid.");
        }

    } catch (err) {
        showLoading(false);
        showModal("Error", err.message);
    }
});
