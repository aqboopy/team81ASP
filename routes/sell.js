/*
author: Rachel Chin
filename: sell.js
description: This is to handle the request and response for sell product
*/
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
// Import the multer instance from your main server file (index.js)
const multer = require('multer');
// Set up storage for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify the folder to save uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Save the file with a unique name
    }
});

const upload = multer({ storage: storage });
const {check, validationResult} = require('express-validator');

const sellValidationRules = ()=>{
    return[
        check("productname","Please input the name of your product!")
            .isLength({min:1, max:50}),
        check("category","Please select a category!")
            .notEmpty(),
        check("price","Please input a valid price!")
            .notEmpty(),
        check("description","Please describe your product!")
            .isLength({min:1,max:100})
    ];
};

//handle sell product submission
router.post("/",upload.single('image'), sellValidationRules(),(req,res)=>{
    const {productname,category,price,description} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){

        const alert = errors.array();
        return res.render("sell",{alert});
    }

    if (!req.file) {
            
        return res.render("sell", { alert: [{ msg: 'Please provide a photo of your product!' }] });
    }
    else{
        //to convert image data to BLOB
        const imagePath = req.file.path;
        const imageBuffer = fs.readFileSync(imagePath);
        const mimeType = req.file.mimetype;//image type

        let insertQuery = "INSERT INTO products (name,category,price,description,image,image_type,date_listed,user_id) VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP,?)";
        global.db.run(insertQuery,[productname,category,price,description,imageBuffer,mimeType,req.session.userdata?.user_id],(err,result)=>{
            if(err){
                console.log(err);
            }
            //remove the files from the temp location
            fs.unlinkSync(imagePath);
            res.redirect("/profile");
        });
    }
});

router.get("/",(req,res)=>{
    res.render("sell",{title: "Sell Product"})
});
module.exports = router;