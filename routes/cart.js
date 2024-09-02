const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.post('/add/:productId', authMiddleware, (req, res) => {
    const productId = req.params.productId;
    const userId = req.session.userdata.id;
    const quantity = req.body.quantity || 1; // Default to 1 if no quantity provided

    if (!userId) {
        return res.status(401).json({ error: "Sign in before adding to cart." });
    }

    const checkCartQuery = "SELECT * FROM cart WHERE user_id = ? AND product_id = ?";
    
    global.db.get(checkCartQuery, [userId, productId], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Internal server error." });
        }

        if (row) {
            // Product already in cart
            const updateCartQuery = "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?";
            
            global.db.run(updateCartQuery, [quantity, userId, productId], function(err) {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ error: "Internal server error." });
                }
                res.status(200).json({ message: "Product quantity updated in cart!" });
            });
        } else {
            // Product not in cart
            const insertCartQuery = "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)";
            
            global.db.run(insertCartQuery, [userId, productId, quantity], function(err) {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ error: "Internal server error." });
                }
                res.status(200).json({ message: "Product added to cart successfully!" });
            });
        }
    });
});


// Route to handle removing a product from the cart
router.post('/remove/:productId', authMiddleware, (req, res) => {
    const productId = req.params.productId;
    const userId = req.session.userdata.id;

    const deleteCartQuery = "DELETE FROM cart WHERE user_id = ? AND product_id = ?";

    global.db.run(deleteCartQuery, [userId, productId], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: "Internal server error." });
        }
        res.status(200).json({ message: "Product removed from cart successfully!" });
    });
});

// Route to display the user's cart
router.get('/', authMiddleware, (req, res) => {
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

        res.render('cart', {
            title: 'Your Cart',
            cartItems: cartItems
        });
    });
});

module.exports = router;
