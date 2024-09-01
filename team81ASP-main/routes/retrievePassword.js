const express = require("express");
const crypto = require("crypto");
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

// Render the retrieve password page
router.get("/", (req, res) => {
	res.render("retrievePassword", { title: "Retrieve Password" });
});

// Handle form submission to send OTP
router.post("/send-otp", (req, res) => {
	const email = req.body.email;

	// Check if the email exists in the database
	global.db.get(
		"SELECT * FROM users WHERE email = ?",
		[email],
		(err, user) => {
			if (err) {
				console.error("Database error:", err.message);
				return res.status(500).send("Internal server error.");
			}
			if (!user) {
				return res.render("retrievePassword", {
					title: "Retrieve Password",
					alert: [{ msg: "Email not found." }],
				});
			}

			// Generate a 6-digit OTP
			const otp = crypto.randomInt(100000, 999999).toString();

			// Store the OTP and email in the session
			req.session.otp = otp;
			req.session.email = email;

			// Send the OTP via email
			const mailOptions = {
				from: "aspteam81@gmail.com",
				to: email,
				subject: "Your OTP Code",
				text: `Your OTP code is: ${otp}`,
			};

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.error("Error sending email:", error.message);
					return res
						.status(500)
						.send("Failed to send OTP. Please try again.");
				}
				res.render("verifyOtp", { title: "Verify OTP" });
			});
		}
	);
});

// Render the OTP verification page
router.get("/verify-otp", (req, res) => {
	res.render("verifyOtp", { title: "Verify OTP" });
});

// Handle OTP verification
router.post("/verify-otp", (req, res) => {
	const otp = req.body.otp;

	// Check if the entered OTP matches the stored OTP
	if (otp === req.session.otp) {
		const email = req.session.email;
		global.db.get(
			"SELECT * FROM users WHERE email = ?",
			[email],
			(err, user) => {
				if (err) {
					console.error(err.message);
					return res.render("verifyOtp", {
						title: "Verify OTP",
						alert: [{ msg: "Database error." }],
					});
				}
				req.session.otp = null; // Clear the OTP after verification
				res.render("displayPassword", {
					title: "Your Password",
					password: user.password,
				});
			}
		);
	} else {
		res.render("verifyOtp", {
			title: "Verify OTP",
			alert: [{ msg: "Invalid OTP. Please try again." }],
		});
	}
});

module.exports = router;
