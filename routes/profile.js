const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    const userdata = req.session.userdata;
    if(userdata == null){
        res.redirect("/login");
    }
    else{
        res.render("profile",{title: "Profile Page (Seller)"})
    }
    
    
});

module.exports = router;