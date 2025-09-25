if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")


async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

main().then(()=>{
    console.log("connection to DB is successful...");
}).catch((err) =>{
    console.log(err);
})


app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '/public')));

app.use(session({
    secret: "ghefdwiyuag1223",
    saveUninitialized: true,
    resave: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000, // week days*24hr*60min*60sec*1000
        httpOnly: true //for security
    }
}))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.edit = req.flash("edit");
    res.locals.dlt = req.flash("dlt");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
})

app.get('/', (req, res) =>{
    res.send("root is working");
})

//routers
app.use("/listings", listingsRouter); 

app.use("/listings/:id/reviews", reviewsRouter);

app.use("/", userRouter);


//ERROR HANDLER-------------------------

app.all('/*splat', (req, res, next) =>{
    next( new ExpressError(404, 'Page Not Found'));
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    console.log(message);
    res.status(statusCode).render('./listings/error.ejs', { statusCode });
});

app.listen(8080, () =>{
    console.log("listening from port...")
})