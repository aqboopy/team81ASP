const express = require("express");
const router = express.Router();

// Render the homepage
router.get("/", (req, res) => {
	global.db.all(
		"SELECT id, name, image, image_type FROM products",
		[],
		(err, products) => {
			if (err) {
				console.error("Failed to retrieve products:", err.message);
				return res.status(500).send("Internal server error.");
			}

			// Convert image buffers to base64 strings for display
			products.forEach((product) => {
				product.image = product.image
					? Buffer.from(product.image).toString("base64")
					: null;
			});

			res.render("index", {
				title: "Home",
				products: products,
			});
		}
	);
});

module.exports = router;
