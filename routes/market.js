const express = require('express');
const router = express.Router();

router.get("/",(req,res)=>{
    res.render("generalMarket",{title: "General Market Page"})
});
router.post("/",(req,res)=>{
    res.render("generalMarket",{title: "General Market Page"})
})
module.exports = router;