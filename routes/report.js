const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

// Set up nodemailer transporter (using Gmail as an example)
const transporter = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		user: "aspteam81@gmail.com",
		pass: "pyez qhpv oxwn afqd",
	},
});

// Render the report page
router.get("/", (req, res) => {
	res.render("report", { title: "Report Issue" });
});

// Handle form submission and send the report via email
router.post("/", (req, res) => {
	const issue = req.body.issue;
	const sellerName = req.body.sellerName;
	const description = req.body.description;

	// Email options
	const mailOptions = {
		from: "aspteam81@gmail.com",
		to: "aspteam81@gmail.com", // Replace with your team's email
		subject: `New Report: ${issue}`,
		text: `Issue: ${issue}\nSeller Name: ${sellerName}\nDescription: ${description}`,
	};

	// Send the email
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error("Error sending report email:", error.message);
			return res
				.status(500)
				.send("Failed to send report. Please try again.");
		}
		res.render("report", {
			title: "Report Issue",
			successMessage: "Report sent successfully!",
		});
	});
});

module.exports = router;
