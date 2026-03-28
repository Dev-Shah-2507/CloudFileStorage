import {
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE,
	VERIFICATION_EMAIL_TEMPLATE,
	WELCOME_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailTrapConfig.js";

export const sendVerificationEmail = async (email, verificationToken) => {
	const recipient = [{ email }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Verify your email",
			html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
			category: "Email Verification",
		});

		console.log("Email sent successfully", response);
	} catch (error) {
		console.error(`Error sending verification`, error);

		throw new Error(`Error sending verification email: ${error}`);
	}
};

export const sendWelcomeEmail = async (email , name) => {
	const recipient = [{email}]

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "You are welcomed !!",
			html: WELCOME_EMAIL_TEMPLATE
			    .replace("{name}", name)
			    .replace("{loginUrl}", email),
			category: "Welcome Email",
		})
	}
	catch(err) {
		res.status(400).json({success:false , message:'Server error'})
	}
}

export const sendChangePasswordEmail = async (email , resetURL) => {
	const recipient = [{email}]

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Change Password !!",
			html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
			category: "Reset password",
		})
	}
	catch(err) {
		console.log(err)
		res.status(400).json({success:false , message:'Server error'})
	}
}

export const sendResetPasswordSuccessEmail = async (email) => {
	const recipient = [{email}]

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Change Password success !!",
			html: PASSWORD_RESET_SUCCESS_TEMPLATE,
			category: "Reset password success",
		})
	}
	catch(err) {
		console.log(err)
		res.status(400).json({success:false , message:'Server error'})
	}
}