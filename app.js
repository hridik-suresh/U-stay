const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js")


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

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));

app.get('/', (req, res) =>{
    res.send("root is working");
})

//routers
app.use("/listings", listings); 

app.use("/listings/:id/reviews", reviews);


//ERROR HANDLER-------------------------

app.all('/*splat', (req, res, next) =>{
    next( new ExpressError(404, 'Page Not Found'));
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render('./listings/error.ejs', { statusCode });
});

app.listen(8080, () =>{
    console.log("listening from port...")
})