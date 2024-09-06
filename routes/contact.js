const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		user: "aspteam81@gmail.com",
		pass: "pyez qhpv oxwn afqd",
	},
});

// Render the contact us page
router.get("/", (req, res) => {
	res.render("contact", { title: "Contact Us" });
});

// Handle form submission and send contact email
router.post("/", (req, res) => {
	const fullName = req.body.fullName;
	const email = req.body.email;
	const message = req.body.message;

	// Email options
	const mailOptions = {
		from: email, // Sender's email
		to: "aspteam81@gmail.com", // Replace with your email
		subject: `New Contact Message from ${fullName}`,
		text: `Full Name: ${fullName}\nEmail: ${email}\nMessage: ${message}`,
	};

	// Send the email
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error("Error sending contact email:", error.message);
			return res
				.status(500)
				.send("Failed to send message. Please try again.");
		}
		res.render("contact", {
			title: "Contact Us",
			successMessage: "Message sent successfully!",
		});
	});
});

module.exports = router;
