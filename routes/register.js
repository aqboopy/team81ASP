/*
author: Rachel Chin
filename: register.js
description: This is to handle the request and response for register user
*/

const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');

const registerValidationRules = ()=>{
    return[
        check("username","Please input your name!")
            .isLength({min:1,max:50}),
        check("email","Please input your email!")
            .isEmail(),
        check("password","Please input your password!")
            .isLength({min:1,max:50})
    ];
};
//render register page
router.get("/", (req, res) => {
	res.render("register",{ title: "Register" });
});
//handle register submission
router.post("/",registerValidationRules(),(req,res)=>{
    //get values from form
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    //validation
    const errors = validationResult(req);
    if(!errors.isEmpty()){

        const alert = errors.array();
        res.render("register",{alert,title: "Register"});
    }
    else{
        let insertQuery = "INSERT INTO users (username,email,password) VALUES (?,?,?)";
        global.db.run(insertQuery,[username,email,password],(err,result)=>{
            if(err){
                console.log(err);
            }
            else{
                let sqlQuery = "SELECT * FROM users WHERE email=?"
                global.db.get(sqlQuery,[email],(err2,result2)=>{
                    if(err2){
                        console.log(err2);
                    }
                    req.session.userdata = result2;
                    res.redirect("/");
                });
            }         
            
        });
    }
});

module.exports = router;