/*
author: nurleena muhammad hilmi
filename: likes.js
description: 
*/

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Route to handle displaying likes for the logged-in user
router.get('/', authMiddleware, (req, res) => {
    const userId = req.session.userdata && req.session.userdata.id;

    if (!userId) {
        // If userId is undefined, send an error response
        return res.status(401).json({ error: 'Sign in before viewing likes.' });
    }

    // Query to get likes for the user
    global.db.all('SELECT products.id, products.name, products.price, products.description, products.image, products.image_type FROM likes JOIN products ON likes.product_id = products.id WHERE likes.user_id = ?', [userId], (err, rows) => {
        if (err) {
            console.error('Failed to retrieve likes:', err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Render likes page with the likes data
        res.render('likes', { title: 'My Likes', likes: rows });
    });
});

// Route to handle adding a like
router.post('/like', (req, res) => {
    const userId = req.session.userdata && req.session.userdata.id;
    const productId = req.body.productId;

    if (!userId) {
        // If userId is undefined, send an error response
        return res.status(401).json({ error: 'Sign in before liking.' });
    }

    // Insert like into the database
    global.db.run('INSERT INTO likes (user_id, product_id) VALUES (?, ?)', [userId, productId], (err) => {
        if (err) {
            console.error('Failed to add like:', err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Redirect back to the page or send a success response
        res.redirect('back');
    });
});

// Route to handle removing a like
router.post('/unlike', (req, res) => {
    const likeId = req.body.likeId;

    // Delete like from the database
    global.db.run('DELETE FROM likes WHERE id = ?', [likeId], (err) => {
        if (err) {
            console.error('Failed to remove like:', err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Redirect back to the page or send a success response
        res.redirect('back');
    });
});

module.exports = router;
