/*
author: Rachel Chin
filename: reward.js
description: This is to handle the request and response for points reward system
*/
const express = require('express');
const router = express.Router();

router.get("/",(req,res)=>{
    let sqlQuery = "SELECT * FROM rewards ORDER BY costPoints ASC";
    global.db.all(sqlQuery,(err,result)=>{
        if(err){
            console.log(err);
            return res.status(500).send("Internal server error.");
        }
        req.session.rewards = result;
        res.render("reward",{title:"Redeem Points", rewards: result});
    });
    
});

router.get("/redeem/:id",(req,res)=>{
    const rewardID = req.params.id;
    
    let sqlQuery = "SELECT * FROM rewards WHERE id=?";
    global.db.get(sqlQuery,[rewardID],(err,rewardInfo)=>{
        if(err){
            console.log(err);
            return res.status(500).send("Internal server error.");
        }
        if(req.session.userdata.points < rewardInfo.costPoints){
            const alert = { message: "You do not have enough points!" };
            res.render("reward",{title:"Redeem Points", rewards: req.session.rewards, alert: alert});
        }
        else{
            var pointsLeft = req.session.userdata.points-rewardInfo.costPoints;
            let insertQuery = "INSERT INTO redeemed (user_id,reward_id) VALUES (?,?)";
            global.db.run(insertQuery,[req.session.userdata.id,rewardID],(err)=>{
                if(err){
                    console.log(err);
                    return res.status(500).send("Internal server error.");
                }
                let updateQuery = "UPDATE users SET points=? WHERE id=?";
                global.db.run(updateQuery,[pointsLeft,req.session.userdata.id],(err)=>{
                    if(err){
                        console.log(err);
                        return res.status(500).send("Internal server error.");
                    }
                    const alert = { message: "Points redeemed!" };
                    res.render("reward",{title: "Redeem Points",rewards: req.session.rewards, alert: alert});
                });
            }); 
        }
    });

});

module.exports = router;