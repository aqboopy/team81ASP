/*
author: Rachel Chin
filename: login.js
description: This is to handle the request and response for user login
*/

const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// Login validation rules
const loginValidationRules = () => {
	return [
		check("email", "Please input your email!").isEmail(),
		check("password", "Please input your password!").isLength({
			min: 1,
			max: 50,
		}),
	];
};

// Render login page
router.get("/", (req, res) => {
	res.render("login", { title: "Login/Sign Up" });
});

// Handle login submission
router.post("/", loginValidationRules(), (req, res) => {
	const email = req.body.email;
	const password = req.body.password;

	// Validation
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const alert = errors.array();
		return res.render("login", { alert, title: "Login/Sign Up" });
	}

	// Query to find the user by email
	const sqlQuery = "SELECT * FROM users WHERE email = ?";
	global.db.get(sqlQuery, [email], (err, result) => {
		if (err) {
			console.log(err);
			return res.status(500).send("Internal server error.");
		}

		// If user not found
		if (result == null) {
			const failAlert = { message: "Email not found!" };
			return res.render("login", { failAlert, title: "Login/Sign Up" });
		}

		// If password doesn't match
		if (password != result.password) {
			const failAlert = { message: "Incorrect password!" };
			return res.render("login", { failAlert, title: "Login/Sign Up" });
		}

		// Store user information in session
		req.session.userdata = {
			id: result.id,
			username: result.username, // Assuming your users table has a 'name' column
			email: result.email,
			points: result.points
		};

		// Redirect to the homepage
		res.redirect("/");
	});
});

module.exports = router;
