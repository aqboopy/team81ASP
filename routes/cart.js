// author: nurleena muhammad hilmi

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add/:productId", authMiddleware, (req, res) => {
	const productId = req.params.productId;
	const userId = req.session.userdata.id;
	const quantity = req.body.quantity || 1; // Default to 1 if no quantity provided

	if (!userId) {
		return res
			.status(401)
			.json({ error: "Sign in before adding to cart." });
	}

	const checkCartQuery =
		"SELECT * FROM cart WHERE user_id = ? AND product_id = ?";

	global.db.get(checkCartQuery, [userId, productId], (err, row) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({ error: "Internal server error." });
		}

		if (row) {
			// Product already in cart
			const updateCartQuery =
				"UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?";

			global.db.run(
				updateCartQuery,
				[quantity, userId, productId],
				function (err) {
					if (err) {
						console.error(err.message);
						return res
							.status(500)
							.json({ error: "Internal server error." });
					}
					res.status(200).json({
						message: "Product quantity updated in cart!",
					});
				}
			);
		} else {
			// Product not in cart
			const insertCartQuery =
				"INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)";

			global.db.run(
				insertCartQuery,
				[userId, productId, quantity],
				function (err) {
					if (err) {
						console.error(err.message);
						return res
							.status(500)
							.json({ error: "Internal server error." });
					}
					res.status(200).json({
						message: "Product added to cart successfully!",
					});
				}
			);
		}
	});
});

// Route to handle removing a product from the cart
router.post("/remove/:id", authMiddleware, (req, res) => {
	const userId = req.session.userdata.id;
	const productId = req.params.id;

	const removeQuery = `
        DELETE FROM cart
        WHERE user_id = ? AND product_id = ?
    `;

	global.db.run(removeQuery, [userId, productId], (err) => {
		if (err) {
			console.error(err.message);
			return res.status(500).send("Internal server error.");
		}

		// Redirect to cart page with a success message
		res.redirect("/cart?update=remove-success");
	});
});

// Route to display the user's cart
router.get("/", authMiddleware, (req, res) => {
	const userId = req.session.userdata.id;

	const cartQuery = `
        SELECT products.*, cart.quantity
        FROM cart
        JOIN products ON cart.product_id = products.id
        WHERE cart.user_id = ?
    `;

	global.db.all(cartQuery, [userId], (err, cartItems) => {
		if (err) {
			console.error(err.message);
			return res.status(500).send("Internal server error.");
		}

		// Added by Rachel Chin
		const voucherQuery = `SELECT r.id, rr.rewardName, rr.value
								FROM redeemed r JOIN rewards rr ON r.reward_id = rr.id 
								WHERE r.user_id = ?`;
		global.db.all(voucherQuery,[userId],(err,vouchers)=>{
			if(err){
				console.error(err.message);
				return res.status(500).send("Internal server error.");
			}
			// End

			// Convert BLOB data to Base64 for each cart item
			cartItems.forEach((item) => {
				if (item.image) {
					item.image = Buffer.from(item.image).toString("base64");
				}
			});

			// Calculate total price
			const totalPrice = cartItems.reduce((total, item) => {
				return total + item.price * item.quantity;
			}, 0);

			// Pass the update status and total price to the template
			const updateStatus = req.query.update || "";

			res.render("cart", {
				title: "Your Cart",
				cartItems: cartItems,
				updateStatus: updateStatus,
				totalPrice: totalPrice,
				availVouchers: vouchers //added by Rachel Chin
			});
			
		});	
	});
});

// Route to handle updating the quantity of a product in the cart
router.post("/update/:productId", authMiddleware, (req, res) => {
	const productId = req.params.productId;
	const userId = req.session.userdata.id;
	const quantity = parseInt(req.body.quantity, 10);

	// Ensure quantity is a positive number
	if (isNaN(quantity) || quantity < 1) {
		return res.status(400).send("Invalid quantity.");
	}

	const updateCartQuery =
		"UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?";

	global.db.run(
		updateCartQuery,
		[quantity, userId, productId],
		function (err) {
			if (err) {
				console.error(err.message);
				return res.status(500).send("Internal server error.");
			}
			// Redirect with a query parameter indicating success
			res.redirect("/cart?update=success");
		}
	);
});

module.exports = router;
