/*
author: Rachel Chin, Nurleena
filename: market.js
description: This is to handle the request and response for all
product market related things
*/

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", (req, res) => {
	var essentialProducts, householdProducts, electronicProducts;
	let essentialQuery =
		"SELECT * FROM products WHERE category='Essentials' LIMIT 3";
	global.db.all(essentialQuery, (err, result) => {
		if (err) {
			console.log(err);
		}
		if (result == null) {
			essentialProducts = null;
		} else {
			essentialProducts = result;
			// Convert BLOB data to base64 for each product
			essentialProducts.forEach((product) => {
				if (product.image) {
					product.image = Buffer.from(product.image).toString(
						"base64"
					);
				}
			});
		}
		let householdQuery =
			"SELECT * FROM products WHERE category='Household Items' LIMIT 3";
		global.db.all(householdQuery, (err2, result2) => {
			if (err2) {
				console.log(err2);
			}
			if (result2 == null) {
				householdProducts = null;
			} else {
				householdProducts = result2;
				// Convert BLOB data to base64 for each product
				householdProducts.forEach((product) => {
					if (product.image) {
						product.image = Buffer.from(product.image).toString(
							"base64"
						);
					}
				});
			}
			let electronicQuery =
				"SELECT * FROM products WHERE category='Electronics' LIMIT 3";
			global.db.all(electronicQuery, (err3, result3) => {
				if (err3) {
					console.log(err3);
				}
				if (result3 == null) {
					electronicProducts = null;
				} else {
					electronicProducts = result3;
					// Convert BLOB data to base64 for each product
					electronicProducts.forEach((product) => {
						if (product.image) {
							product.image = Buffer.from(product.image).toString(
								"base64"
							);
						}
					});
				}
				res.render("generalMarket", {
					essentialdata: essentialProducts,
					householddata: householdProducts,
					electronicdata: electronicProducts,
					title: "General Market Page",
				});
			});
		});
	});
});

//render category page based on URL Param
router.get("/:category", (req, res) => {
	//get category from URL param
	var category = req.params.category;
	let sqlQuery = "SELECT * FROM products WHERE category like ?";
	global.db.all(sqlQuery, [category], (err, products) => {
		if (err) {
			console.log(err);
		}
		// Convert BLOB data to base64 for each product
		products.forEach((product) => {
			if (product.image) {
				product.image = Buffer.from(product.image).toString("base64");
			}
		});
		res.render("categoryMarket", {
			category: category,
			productsdata: products,
			title: "Market Page (Specified Category)",
		});
	});
});

// Render product listing page for product
router.get("/listing/:id", (req, res) => {
	const productId = req.params.id;

	// Query to fetch the product and the associated seller (user)
	const productQuery = `
        SELECT products.*, users.username 
        FROM products 
        JOIN users ON products.user_id = users.id 
        WHERE products.id = ?;
    `;

	// Query to fetch reviews for the product
	const reviewsQuery = `
        SELECT reviews.*, users.username AS reviewer_name 
        FROM reviews 
        JOIN users ON reviews.user_id = users.id 
        WHERE reviews.product_id = ?
        ORDER BY reviews.date DESC;
    `;

	// Fetch the product details
	global.db.get(productQuery, [productId], (err, product) => {
		if (err) {
			console.error("Database error:", err.message);
			return res.status(500).send("Internal server error.");
		}

		if (!product) {
			return res.status(404).send("Product not found.");
		}

		// Convert BLOB to Base64 for product image
		if (product.image) {
			product.image = Buffer.from(product.image).toString("base64");
		}

		// Fetch the reviews for the product
		global.db.all(reviewsQuery, [productId], (err, reviews) => {
			if (err) {
				console.error("Database error (reviews):", err.message);
				return res.status(500).send("Internal server error.");
			}

			// Render the listing page with the product, reviews, and sessionUser
			res.render("listing", {
				title: product.name,
				product: product,
				reviews: reviews.length > 0 ? reviews : null, // Pass null if no reviews
				sessionUser: req.session.userdata || null, // Pass the logged-in user data or null if not logged in
			});
		});
	});
});

router.post("/search",(req,res)=>{
	const searchInput = req.body.search;
	const searchTerm = `%${searchInput}%`;
	var failAlert = null;
	let sqlQuery = "SELECT * FROM PRODUCTS WHERE name LIKE ?";
	global.db.all(sqlQuery,[searchTerm],(err,products)=>{
		if(err){
			console.error("Database error (products):", err.message);
			return res.status(500).send("Internal server error.");
		}

		if(products.length > 0){
			// Convert BLOB data to base64 for each product
			products.forEach((product) => {
				if (product.image) {
					product.image = Buffer.from(product.image).toString("base64");
				}
			});
		}
		else{
			failAlert = { message: "No results found. Please ensure there are no misspellings." };
		}
		
		res.render("searchResult",{searchresult: products, title: "Search Results", failAlert: failAlert});
	});
});

//added by nurleena
// Route to handle liking a product
router.post("/like/:productId", authMiddleware, (req, res) => {
	const productId = req.params.productId;
	const userId = req.session.userdata.id;

	// Check if the user is authenticated
	if (!userId) {
		return res.status(401).json({ message: "Sign in before liking." });
	}

	const checkLikeQuery =
		"SELECT * FROM likes WHERE user_id = ? AND product_id = ?";

	global.db.get(checkLikeQuery, [userId, productId], (err, row) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({ message: "Internal server error." });
		}

		if (row) {
			return res
				.status(400)
				.json({ message: "You have already liked this product." });
		}

		const insertLikeQuery =
			"INSERT INTO likes (user_id, product_id) VALUES (?, ?)";

		global.db.run(insertLikeQuery, [userId, productId], function (err) {
			if (err) {
				console.error(err.message);
				return res
					.status(500)
					.json({ message: "Internal server error." });
			}
			res.status(200).json({ message: "Product liked successfully!" });
		});
	});
});
router.post("/like/:productId", authMiddleware, (req, res) => {
	const productId = req.params.productId;
	const userId = req.session.userdata.id;

	// Check if the user is authenticated
	if (!userId) {
		return res.status(401).json({ message: "Sign in before liking." });
	}

	const checkLikeQuery =
		"SELECT * FROM likes WHERE user_id = ? AND product_id = ?";

	global.db.get(checkLikeQuery, [userId, productId], (err, row) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({ message: "Internal server error." });
		}

		if (row) {
			return res
				.status(400)
				.json({ message: "You have already liked this product." });
		}

		const insertLikeQuery =
			"INSERT INTO likes (user_id, product_id) VALUES (?, ?)";

		global.db.run(insertLikeQuery, [userId, productId], function (err) {
			if (err) {
				console.error(err.message);
				return res
					.status(500)
					.json({ message: "Internal server error." });
			}
			res.status(200).json({ message: "Product liked successfully!" });
		});
	});
});

router.get("/likes", authMiddleware, (req, res) => {
	const userId = req.session.userdata.id;
	const likesQuery = `
        SELECT products.*, likes.id as like_id 
        FROM likes 
        JOIN products ON likes.product_id = products.id 
        WHERE likes.user_id = ?
    `;

	global.db.all(likesQuery, [userId], (err, likes) => {
		if (err) {
			console.error(err.message);
			return res.status(500).send("Internal server error.");
		}

		// Convert BLOB data to Base64 for each liked product
		likes.forEach((like) => {
			if (like.image) {
				like.image = Buffer.from(like.image).toString("base64");
			}
		});

		res.render("likes", {
			title: "Liked Products",
			likes: likes,
		});
	});
});

// Route to handle adding a product to the cart
router.post("/cart/add/:productId", authMiddleware, (req, res) => {
	const productId = req.params.productId;
	const userId = req.session.userdata.id;
	const quantity = req.body.quantity || 1; // Default to 1 if no quantity provided

	// Check if the user is authenticated
	if (!userId) {
		return res
			.status(401)
			.json({ message: "Sign in before adding to cart." });
	}

	// Check if the product is already in the cart
	const checkCartQuery =
		"SELECT * FROM cart WHERE user_id = ? AND product_id = ?";

	global.db.get(checkCartQuery, [userId, productId], (err, row) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({ message: "Internal server error." });
		}

		if (row) {
			// Update quantity if already in cart
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
							.json({ message: "Internal server error." });
					}
					res.status(200).json({
						message: "Product quantity updated in cart!",
					});
				}
			);
		} else {
			// Add new product to cart
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
							.json({ message: "Internal server error." });
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
router.post("/cart/remove/:productId", authMiddleware, (req, res) => {
	const productId = req.params.productId;
	const userId = req.session.userdata.id;

	const deleteCartQuery =
		"DELETE FROM cart WHERE user_id = ? AND product_id = ?";

	global.db.run(deleteCartQuery, [userId, productId], function (err) {
		if (err) {
			console.error(err.message);
			return res.status(500).json({ message: "Internal server error." });
		}
		res.status(200).json({
			message: "Product removed from cart successfully!",
		});
	});
});

// Route to display the user's cart
router.get("/cart", authMiddleware, (req, res) => {
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

		// Convert BLOB data to Base64 for each cart item
		cartItems.forEach((item) => {
			if (item.image) {
				item.image = Buffer.from(item.image).toString("base64");
			}
		});

		res.render("cart", {
			title: "Your Cart",
			cartItems: cartItems,
		});
	});
});

//end

router.post("/", (req, res) => {
	res.render("generalMarket", { title: "General Market Page" });
});

module.exports = router;
