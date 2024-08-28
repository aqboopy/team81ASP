const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
	res.render("Login", { title: "Login/Sign Up" });
});

module.exports = router;
