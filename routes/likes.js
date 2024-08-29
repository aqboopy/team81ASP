const express = require("express");
const router = express.Router();


// Route to handle displaying likes for the logged-in user
router.get('/likes', (req, res) => {
    // Retrieve user ID from session or authentication
    const userId = req.session.userId;

    // Query to get likes for the user
    global.db.all('SELECT * FROM likes WHERE user_id = ?', [userId], (err, rows) => {
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
    const userId = req.session.userId;
    const item = req.body.item;

    // Insert like into the database
    global.db.run('INSERT INTO likes (user_id, item) VALUES (?, ?)', [userId, item], (err) => {
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
