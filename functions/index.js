const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Gmail + App Password
const senderEmail = "YOUR_GMAIL@gmail.com";
const senderPass = "YOUR_GMAIL_APP_PASSWORD";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: senderEmail,
        pass: senderPass
    }
});

exports.sendTemporaryPassword = functions.database
    .ref("/users/{uid}")
    .onCreate(async (snapshot, context) => {
        const data = snapshot.val();

        if (!data.email || !data.tempPassword) {
            console.log("Missing email or password, skipping email.");
            return null;
        }

        const mailOptions = {
            from: `Barangay 186 <${senderEmail}>`,
            to: data.email,
            subject: "Your Temporary Password",
            text: `
Hello ${data.username || "User"},

Your Barangay 186 account has been created.

Your temporary password is:
${data.tempPassword}

Please log in and change this password immediately.

Barangay 186 Information System
`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log("Email sent to:", data.email);
        } catch (error) {
            console.error("Email sending error:", error);
        }

        return null;
    });
