const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/app.db");

router.get("/", (req, res) => {
	db.all("SELECT * FROM users", (err, rows) => {
		if (err) {
			return res.status(500).send("Error retrieving users");
		}
		res.render("users", { title: "User List", users: rows });
	});
});

router.post("/add", (req, res) => {
	const { name, email } = req.body;
	db.run(
		"INSERT INTO users (name, email) VALUES (?, ?)",
		[name, email],
		(err) => {
			if (err) {
				return res.status(500).send("Error adding user");
			}
			res.redirect("/users");
		}
	);
});

module.exports = router;
