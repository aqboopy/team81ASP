const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const checkoutValidationRules = () => {
    return [
      check("firstName", "Please input your name!").notEmpty(),
      check("lastName", "Please input your name!").notEmpty(),
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

router.post("/", checkoutValidationRules(), (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const creditNumber = req.body.creditNumber;
    const cvv = req.body.cvv;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array();
      // Re-render the form with the previous values for username and email
      res.render('checkout', { alert, title: "Check Out", firstName, lastName, creditNumber, cvv });
    } else {
        res.status(200).json({
            message: "Product purchased successfully!",
        });
    }
  });

module.exports = router;