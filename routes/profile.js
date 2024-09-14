const express = require("express");
const router = express.Router();

// Middleware to ensure the user is logged in
const ensureLoggedIn = (req, res, next) => {
	if (req.session.userdata) {
		next();
	} else {
		res.redirect("/login");
	}
};

// Fetch profile data (for logged-in user or another seller)
router.get("/:id?", ensureLoggedIn, (req, res) => {
	const userId = req.params.id ? req.params.id : req.session.userdata.id; // Use URL param if viewing another seller's profile, or use session if viewing logged-in user

	// Fetch user details (either the logged-in user or another seller)
	const userQuery = "SELECT * FROM users WHERE id = ?";
	global.db.get(userQuery, [userId], (err, user) => {
		if (err) {
			console.error("Error fetching user:", err.message);
			return res.status(500).send("Internal server error.");
		}
		if (!user) {
			return res.status(404).send("User not found.");
		}

		// Fetch listings for this user
		const listingsQuery = "SELECT * FROM products WHERE user_id = ?";
		global.db.all(listingsQuery, [userId], (err, listings) => {
			if (err) {
				console.error("Error fetching listings:", err.message);
				return res.status(500).send("Internal server error.");
			}

			// Convert BLOB data to Base64 for each listing image
			listings.forEach((listing) => {
				if (listing.image) {
					listing.image = Buffer.from(listing.image).toString(
						"base64"
					);
				}
			});

			// Fetch reviews for this user (optional)
			const reviewsQuery = "SELECT * FROM reviews WHERE user_id = ?";
			global.db.all(reviewsQuery, [userId], (err, reviews) => {
				if (err) {
					console.error("Error fetching reviews:", err.message);
					return res.status(500).send("Internal server error.");
				}
				
				//Added by Rachel Chin
				//Fetch redeemed rewards for this user
				let sqlQuery = `SELECT * FROM redeemed rr JOIN rewards r ON rr.reward_id=r.id
								WHERE rr.user_id= ?`;
				global.db.all(sqlQuery,[userId],(err,redeemedRewards)=>{
					if (err) {
						console.error("Error fetching redeemed rewards:", err.message);
						return res.status(500).send("Internal server error.");
					}
					// Render the profile page with the fetched data
					res.render("profile", {
						title: user.username + "'s Profile",
						user: user,
						listings: listings,
						reviews: reviews,
						isOwnProfile: !req.params.id, // Check if this is the logged-in user's profile
						redeemedRewards: redeemedRewards,//added by Rachel Chin
					});
				});			
			});
		});
	});
});

module.exports = router;
