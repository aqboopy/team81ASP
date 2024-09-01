/*
author: Rachel Chin
filename: profile.js
description: This is to handle the request and response for user profile
*/

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