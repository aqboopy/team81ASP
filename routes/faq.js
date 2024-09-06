const express = require("express");
const router = express.Router();

// Render the FAQ page
router.get("/", (req, res) => {
	res.render("faq", { title: "FAQs" });
});

module.exports = router;
