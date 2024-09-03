// added by nurleena
module.exports = function (req, res, next) {
    if (req.session.userdata && req.session.userdata.id) {
        return next(); // User is authenticated, proceed to the next middleware or route handler
    }
    // User is not authenticated
    res.status(401).json({ error: "Sign in before liking." });
};

