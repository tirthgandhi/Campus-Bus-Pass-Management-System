const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendVerificationEmail = async (email, verificationToken) => {
    const verificationUrl =
        `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;

    const mailOptions = {
        from: `"Campus Bus Management System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your Campus Bus account",
        html: `
            <h2>Welcome to Campus Bus Management System</h2>

            <p>Thank you for registering.</p>

            <p>Please click the button below to verify your email address:</p>

            <p>
                <a href="${verificationUrl}">
                    Verify Email
                </a>
            </p>

            <p>If you did not create this account, you can ignore this email.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = {
    sendVerificationEmail
};
