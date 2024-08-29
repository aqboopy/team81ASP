/*
author: Rachel Chin
filename: market.js
description: This is to handle the request and response for all
product market related things
*/

const express = require('express');
const router = express.Router();

router.get("/",(req,res)=>{
    var essentialProducts, householdProducts,electronicProducts;
    let essentialQuery = "SELECT * FROM products WHERE category='Essentials' LIMIT 3";
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
        let householdQuery = "SELECT * FROM products WHERE category='Household Items' LIMIT 3";
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
            let electronicQuery = "SELECT * FROM products WHERE category='Electronics' LIMIT 3";
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
                res.render("generalMarket",{essentialdata: essentialProducts, householddata: householdProducts, 
                    electronicdata: electronicProducts,title: "General Market Page"});
            });
        });
    });
});

//render category page based on URL Param
router.get("/:category",(req,res)=>{
    //get category from URL param
    var category = req.params.category;
    let sqlQuery = "SELECT * FROM products WHERE category like ?";
    global.db.all(sqlQuery,[category],(err,products)=>{
        if(err){
            console.log(err);
        }
        // Convert BLOB data to base64 for each product
        products.forEach(product => {
            if (product.image) {
                product.image = Buffer.from(product.image).toString('base64');
            }
        });
        res.render("categoryMarket",{category: category,productsdata: products,title:"Market Page (Specified Category)"});
    });
});

//render product listing page for product
router.get("/listing/:id",(req,res)=>{
    res.render("listing",{title: "Product Listing Page (Buyer POV)"});
});
router.post("/",(req,res)=>{
    res.render("generalMarket",{title: "General Market Page"})
});

module.exports = router;
