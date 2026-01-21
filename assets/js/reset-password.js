document.getElementById("resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value.trim();
    const user = firebase.auth().currentUser;

    if (!user) {
        alert("Not logged in.");
        return;
    }

    try {
        // Update Firebase Auth password
        await user.updatePassword(newPassword);

        // Mark as changed
        await firebase.database()
            .ref("users/" + user.uid)
            .update({
                tempPassword: false
            });

        alert("Password updated!");
        window.location.href = "complete-form.html";

    } catch (error) {
        alert(error.message);
    }
});
