const express = require("express");
const User = require("../models/User.js");
const router = new express.Router();
router.post("/login", (req, res, next) => {
 const theEmail = req.body.email;
 const thePassword = req.body.password;
 if (theEmail === "" || thePassword === "") {
   res.render("/login", {
     errorMessage: "Please enter both, username and password to sign up."
   });
   return;
 }
 User.findOne({ email: theEmail })
   .then(user => {
     if (!user) {
       res.render("login", {
         errorMessage: "The username doesn't exist."
       });
       return;
     }
     if (bcrypt.compareSync(thePassword, user.password)) {
       req.session.currentUser = user;
       res.redirect("/");
     } else {
       res.render("login", {
         errorMessage: "Incorrect password"
       });
     }
   })
   .catch(error => {
     next(error);
   });
});
router.post("/signup", (req, res) => {
 res.render("/signup");
});
module.exports = router;

const express = require("express");
const router = express.Router();
/* GET home page */
router.get("/", (req, res, next) => {
 res.render("index");
});
router.get("/login", (req, res) => {
 res.render("login");
});
router.get("/signup", (req, res) => {
 res.render("signup");
});
module.exports = router;
