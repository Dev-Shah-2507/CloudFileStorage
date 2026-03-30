import {
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    VERIFICATION_EMAIL_TEMPLATE,
    WELCOME_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { transporter, sender } from "./emailConfig.js"; // Import the new config

export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        const response = await transporter.sendMail({
            from: sender,
            to: email, // Nodemailer takes a simple string here
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification", // (Optional: Gmail ignores this, but harmless)
        });

        console.log("Verification email sent successfully", response);
    } catch (error) {
        console.error(`Error sending verification`, error);
        throw new Error(`Error sending verification email: ${error}`);
    }
};

export const sendWelcomeEmail = async (email, name) => {
    try {
        const response = await transporter.sendMail({
            from: sender,
            to: email,
            subject: "You are welcomed !!",
            html: WELCOME_EMAIL_TEMPLATE
                .replace("{name}", name)
                .replace("{loginUrl}", "http://localhost:5173/login"), // Fixed: logic usually points to a URL, not an email
        });

        console.log("Welcome email sent successfully", response);
    } catch (error) {
        console.error("Error sending welcome email", error);
        throw new Error(`Error sending welcome email: ${error}`);
    }
}

export const sendChangePasswordEmail = async (email, resetURL) => {
    try {
        const response = await transporter.sendMail({
            from: sender,
            to: email,
            subject: "Change Password !!",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
        });

        console.log("Password reset email sent successfully", response);
    } catch (error) {
        console.error("Error sending password reset email", error);
        throw new Error(`Error sending password reset email: ${error}`);
    }
}

export const sendResetPasswordSuccessEmail = async (email) => {
    try {
        const response = await transporter.sendMail({
            from: sender,
            to: email,
            subject: "Change Password success !!",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        });

        console.log("Password reset success email sent successfully", response);
    } catch (error) {
        console.error("Error sending password reset success email", error);
        throw new Error(`Error sending password reset success email: ${error}`);
    }
}