// routes/cart.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Display the cart page
router.get("/", authMiddleware, (req, res) => {
  const cartItems = req.session.cart || [];
  res.render("cart", { title: "Shopping Cart", cartItems });
});

// Update cart item quantity
router.post("/update", (req, res) => {
  const { productId, quantity } = req.body;

  // Update cart item quantity logic
  if (req.session.cart) {
    const cartItem = req.session.cart.find((item) => item.id == productId);
    if (cartItem) {
      cartItem.quantity = parseInt(quantity, 10);
    }
  }

  res.json({ success: true });
});

// Remove item from cart
router.post("/remove", (req, res) => {
  const { productId } = req.body;

  // Remove cart item logic
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter((item) => item.id != productId);
  }

  res.json({ success: true });
});

module.exports = router;
