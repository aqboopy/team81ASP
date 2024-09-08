/*
author: nurleena muhammad hilmi
*/

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Route to handle displaying likes for the logged-in user
router.get("/", authMiddleware, (req, res) => {
	const userId = req.session.userdata && req.session.userdata.id;

	if (!userId) {
		// If userId is undefined, send an error response
		return res.status(401).json({ error: "Sign in before viewing likes." });
	}

	// Query to get likes for the user
	global.db.all(
		`
        SELECT products.id, products.name, products.price, products.description, products.image, products.image_type 
        FROM likes 
        JOIN products ON likes.product_id = products.id 
        WHERE likes.user_id = ?
    `,
		[userId],
		(err, rows) => {
			if (err) {
				console.error("Failed to retrieve likes:", err.message);
				res.status(500).send("Internal Server Error");
				return;
			}

			// Convert BLOB data to Base64 for each liked product
			rows.forEach((like) => {
				if (like.image) {
					like.image = Buffer.from(like.image).toString("base64");
				}
			});

			// Render likes page with the likes data
			res.render("likes", { title: "My Likes", likes: rows });
		}
	);
});

// Route to handle removing a like
router.post("/unlike/:productId", authMiddleware, (req, res) => {
	const productId = req.params.productId;
	const userId = req.session.userdata.id;

	global.db.run(
		"DELETE FROM likes WHERE user_id = ? AND product_id = ?",
		[userId, productId],
		function (err) {
			if (err) {
				console.error("Failed to remove like:", err.message);
				return res.status(500).send("Internal Server Error");
			}

			res.redirect(
				"/likes?message=Product successfully removed from likes&type=success"
			);
		}
	);
});

module.exports = router;
