const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user.js");
const passport = require("passport");


//signup--------------------------------
router.get("/signup", (req, res) => {
    res.render("./users/signup.ejs");
})

router.post("/signup", wrapAsync(async (req, res) => {
    try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.flash("success", "Welcome to U-stay!");
    res.redirect("/listings");
    } catch (err) {
        req.flash("dlt", err.message);
        res.redirect("/signup");
    }
}))


//login-----------------------------
router.get("/login", (req, res) => [
    res.render("./users/login.ejs")
])

router.post("/login", passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),  (req, res) => {
    req.flash("success", "Welcome back to U-stay!");
    res.redirect("/listings");
})

module.exports = router;