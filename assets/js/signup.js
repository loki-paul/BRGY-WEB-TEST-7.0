// signup.html
// ----------------------------
// 🔥 FRIENDLY SIGNUP ERROR HANDLER
// ----------------------------
function handleSignupError(error) {
    let message = "Unable to create the account. Please try again.";

    switch (error.code) {
        case "auth/email-already-in-use":
            message = "This email is already registered. Try a different one.";
            break;
        case "auth/invalid-email":
            message = "The email format is invalid.";
            break;
        case "auth/weak-password":
            message = "Generated password is too weak.";
            break;
        case "auth/network-request-failed":
            message = "Network error. Please check your internet connection.";
            break;
    }

    showModal("Signup Error", message);
}



// ----------------------------
// 🔥 SIGNUP FORM HANDLER
// ----------------------------
document.getElementById("createUserForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const middleName = document.getElementById("middleName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const birthday = document.getElementById("birthday").value;
    const email = document.getElementById("email").value.trim();

    if (!firstName || !lastName || !birthday || !email) {
        return showModal("Missing Fields", "Please fill all required fields.");
    }

    // Convert birthday → YYMMDD
    const [yyyy, mm, dd] = birthday.split("-");
    const finalBirthday = yyyy.slice(2) + mm + dd;

    // Temporary password
    const tempPassword = (firstName + finalBirthday).toLowerCase();

    try {
        console.log("Creating user...");

        const userCredential = await auth.createUserWithEmailAndPassword(email, tempPassword);
        const user = userCredential.user;
        const uid = user.uid;

        console.log("User created with UID:", uid);


        // ------------------------------------
        // 🔥 SEND EMAIL VERIFICATION LINK
        // ------------------------------------
        await user.sendEmailVerification();
        console.log("Verification email sent!");



        // ----------------------------
        // Save user data
        // ----------------------------
        await realtimeDB.ref("users/" + uid).set({
            firstName,
            middleName,
            lastName,
            birthday,
            email,
            tempPassword: true,
            completeInfo: false,
            createdAt: new Date().toISOString(),
            emailVerified: false
        });

        console.log("User saved to database!");


        // ----------------------------
        // SHOW MODAL WITH PASSWORD + VERIFICATION NOTE
        // ----------------------------
        showModal(
            "Account Created Successfully",
            `
                <div style="font-size:15px; line-height:1.6;">
                    <b>Temporary Password:</b><br>
                    <span id="tempPassCopy" 
                        style="color:#0d6efd; cursor:pointer; font-weight:600; text-decoration:underline;">
                        ${tempPassword}
                    </span>

                    <br><br>
                    <b>A verification link has been sent to:</b><br>
                    ${email}

                    <br><br>
                    <small>Please verify your email before logging in.</small>
                </div>
            `
        );


        // ENABLE COPY PASSWORD
        setTimeout(() => {
            const tempPassSpan = document.getElementById("tempPassCopy");
            if (tempPassSpan) {
                tempPassSpan.addEventListener("click", () => {
                    navigator.clipboard.writeText(tempPassword).then(() => {
                        tempPassSpan.textContent = `${tempPassword} ✓ Copied!`;
                        setTimeout(() => {
                            tempPassSpan.textContent = tempPassword;
                        }, 1500);
                    });
                });
            }
        }, 300);

        // RESET FORM
        document.getElementById("createUserForm").reset();

    } catch (error) {
        console.error("Signup Error:", error);
        handleSignupError(error);
    }
});
