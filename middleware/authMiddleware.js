// author: nurleena muhammad hilmi
// filename: authMiddleware.js
// description: 

module.exports = function (req, res, next) {
    if (req.session.userdata && req.session.userdata.id) {
        return next(); // User is authenticated, proceed to the next middleware or route handler
    }
    // User is not authenticated
    res.redirect('/login'); // Redirect to the sign-in page
};
