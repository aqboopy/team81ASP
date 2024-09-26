const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const checkoutValidationRules = () => {
    return [
      check("firstName", "Please input your first name!").notEmpty(),
      check("lastName", "Please input your last name!").notEmpty(),
      check("creditNumber", "Card number must be 16 digits long")
        .isNumeric()
        .isLength({ min: 16, max:16 })
        .withMessage("Please enter a valid card number!"),
      check("cvv", "CVV must be 3 digits long")
        .isNumeric()
        .isLength({ min: 3, max:3 })
        .withMessage("Please enter a valid cvv!"),
      check("expiryMonth", "Must be between 1 to 12")
        .notEmpty()
        .bail() //stop validation if field is empty
        .withMessage("Please enter a month!"),
      check("expiryYear", "Must be between 24 to 99")
        .notEmpty()
        .bail() //stop validation if field is empty
        .withMessage("Please enter a year!"),
    ];
  };

router.get("/", (req, res) => res.render('checkout', {title: "Checkout"}));

//added by Rachel Chin
router.post("/pay",(req,res)=>{
  const voucherID = req.body.voucher;
  if(voucherID){
    req.session.voucherId = voucherID;
  }
  res.render('checkout', {title: "Checkout"});
});
//End

router.post("/", checkoutValidationRules(), (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const creditNumber = req.body.creditNumber;
    const voucherID = req.session.voucherId; // added by Rachel Chin
    const cvv = req.body.cvv;
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array();
      // Re-render the form with the previous values for username and email
      res.render('checkout', { alert, title: "Checkout", firstName, lastName, creditNumber, cvv });
    } else {

      // Added by Rachel Chin
      const userID = req.session.userdata.id;
      
      //remove items from cart db
      const deleteCartQuery = "DELETE FROM cart WHERE user_id=?";
      global.db.run(deleteCartQuery,[userID],(err)=>{
        if(err){
          console.log(err);
			    return res.status(500).send("Internal server error.");
        }
      });
      console.log(voucherID);
      //check if there is a selected voucher
      if(voucherID){
        
        //remove the applied voucher from db
        const deleteVoucherQuery = "DELETE FROM redeemed WHERE id=?";
        global.db.run(deleteVoucherQuery,[voucherID],(err)=>{
          if(err){
            console.log(err);
			      return res.status(500).send("Internal server error.");
          }
        });
      }
      res.redirect("/market");
      //end
    }
  });

module.exports = router;