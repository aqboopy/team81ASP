const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
	res.render("index", { title: "Home" });
});

const likesRouter = require('./likes');


module.exports = router;
