const express = require("express");
const router = express.Router();

const {check, validationResult} = require('express-validator');

//login validation rules
const loginValidationRules = ()=>{
    return[
        check("email","Please input your email!")
            .isEmail(),
        check("password","Please input your password!")
            .isLength({min:1,max:50})
    ];
};
//render login page
router.get("/", (req, res) => {
	res.render("Login", { title: "Login/Sign Up" });
});
//handle login submission
router.post("/",loginValidationRules(),(req,res)=>{
    //get values from form
    const email = req.body.email;
    const password = req.body.password;

    //validation
    var failAlert = null;
    const errors = validationResult(req);
    if(!errors.isEmpty()){

        const alert = errors.array();
        res.render("login",{alert,title: "Login/Sign Up"});
    }
    else{
        let sqlQuery = "SELECT * FROM users where email=?";
        global.db.get(sqlQuery,[email],(err,result)=>{
            if(err){
                console.log(err);
            }
            //if cannot find user
            if(result == null){
                failAlert = {message: "Email not found!"};
                return res.render("login",{failAlert,title: "Login/Sign Up"});
            }
            //else check password matches
            else{
                if(password != result.password){
                    failAlert = {message: "Incorrect password!"};
                    return res.render("login",{failAlert,title: "Login/Sign Up"});
                }
            }
			req.session.userdata = result;
            res.redirect("/");
        });
    }
});


module.exports = router;
