const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");


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
    req.login(registeredUser, (err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Welcome to U-stay!");
        res.redirect("/listings");
    })
    } catch (err) {
        req.flash("dlt", err.message);
        res.redirect("/signup");
    }
}))


//login-----------------------------
router.get("/login", (req, res) => [
    res.render("./users/login.ejs")
])

router.post("/login",saveRedirectUrl, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),  (req, res) => {
    req.flash("success", "Welcome back to U-stay!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
})

//logout-------------------------------
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("edit", "You are logged out!");
        res.redirect("/listings");
    })
})

module.exports = router;