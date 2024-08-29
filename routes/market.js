const express = require("express");
const router = express.Router();
const {check, validationResult} = require('express-validator');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Set up temporary storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); //folder to save uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Save the file
    }
});

const upload = multer({ storage: storage });

//sell form validation rules
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

//render general market page
router.post("/", (req, res) => {
	var essentialProducts, householdProducts,electronicProducts, otherProducts;
    let essentialQuery = "SELECT * FROM products WHERE category='Essentials'";
    global.db.all(essentialQuery,(err,result)=>{
        if(err){
            console.log(err);
        }
        if(result == null){
            essentialProducts = null;
        }
        else{
            essentialProducts = result;
            // Convert BLOB data to base64 for each product
            essentialProducts.forEach(product => {
                if (product.image) {
                    product.image = Buffer.from(product.image).toString('base64');
                }
            });
        }
        let householdQuery = "SELECT * FROM products WHERE category='Household Items'";
        global.db.all(householdQuery,(err2,result2)=>{
            if(err2){
                console.log(err2);
            }
            if(result2 == null){
                householdProducts = null;
            }
            else{
                householdProducts = result2;
                // Convert BLOB data to base64 for each product
                householdProducts.forEach(product => {
                    if (product.image) {
                        product.image = Buffer.from(product.image).toString('base64');
                    }
                });
            }
            let electronicQuery = "SELECT * FROM products WHERE category='Electronics'";
            global.db.all(electronicQuery,(err3,result3)=>{
                if(err3){
                    console.log(err3);
                }
                if(result3 == null){
                    electronicProducts = null;
                }
                else{
                    electronicProducts = result3;
                    // Convert BLOB data to base64 for each product
                    electronicProducts.forEach(product => {
                        if (product.image) {
                            product.image = Buffer.from(product.image).toString('base64');
                        }
                    });
                }
                let otherQuery = "SELECT * FROM products WHERE category='Others'";
                global.db.all(otherQuery,(err4,result4)=>{
                    if(err4){
                        console.log(err4);
                    }
                    if(result4 == null){
                        otherProducts = null;
                    }
                    else{
                        otherProducts = result4;
                        // Convert BLOB data to base64 for each product
                        householdProducts.forEach(product => {
                            if (product.image) {
                                product.image = Buffer.from(product.image).toString('base64');
                            }
                        });
                    }
                    res.render("market",{essentialdata: essentialProducts, householddata: householdProducts, 
						electronicdata: electronicProducts, otherdata: otherProducts, title: "General Market Page"});
                });
            });
        });
    });
});

//render sell product page
router.get("/sell",(req,res)=>{
	res.render("sell",{title: "Sell Product"});
});

//handle sell product submission
router.post("/sellProduct",upload.single('image'), sellValidationRules(),(req,res)=>{
    const {productname,category,price,description} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){

        const alert = errors.array();
        return res.render("sell",{alert,title: "Sell Product"});
    }

    if (!req.file) {
            
        return res.render("sell", { alert: [{ msg: 'Please provide a photo of your product!',title: "Sell Product" }] });
    }
    else{
        //to convert image data to BLOB
        const imagePath = req.file.path;
        const imageBuffer = fs.readFileSync(imagePath);
        const mimeType = req.file.mimetype;//image type

        let insertQuery = "INSERT INTO products (name,category,price,description,image,image_type,date_listed,user_id) VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP,?)";
        global.db.run(insertQuery,[productname,category,price,description,imageBuffer,mimeType,req.session.userdata?.id],(err,result)=>{
            if(err){
                console.log(err);
            }
            //remove the files from the temp location
            fs.unlinkSync(imagePath);
            res.redirect("/profile");
        });
    }
});

module.exports = router;