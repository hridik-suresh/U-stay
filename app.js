const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js')
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');

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

//INDEX--READ-----------------------------
app.get('/listings', wrapAsync(async (req, res, next)=> {
    let allListings = await Listing.find({});
    res.render('./listings/index.ejs', {allListings});
}))

//NEW CREATION---CREATE-------------------
app.get('/listings/new', (req, res) =>{
    res.render('./listings/new.ejs');
})
app.post('/listings', wrapAsync(async (req, res, next) =>{
    if(!req.body.listing){
        throw new ExpressError(400, 'Send valid data for listinng');

    }
    // let listing = req.body.listing;
    // console.log(listing);

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');
    
}))

//SINGLE SHOW----READ-----------------------
app.get('/listings/:id', wrapAsync(async (req, res, next) =>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    // console.log(listing);
    res.render('./listings/show.ejs', {listing});
}))

//EDIT AND UPDATE----------------------------
app.get('/listings/:id/edit',wrapAsync( async (req, res, next) =>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render('./listings/edit.ejs', {listing});
}))

app.put('/listings/:id', wrapAsync(async(req,res, next) =>{
    if(!req.body.listing){
    throw new ExpressError(400, 'Send valid data for listinng');

    }
    
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
    
}))

//DELETE----DESTROY-----------------------
app.delete('/listings/:id', wrapAsync(async (req, res, next) =>{
    let {id} = req.params;
    let deletedPost = await Listing.findByIdAndDelete(id);
    console.log(deletedPost);
    res.redirect('/listings');
}))


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