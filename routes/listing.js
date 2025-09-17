const express = require("express");
const router = express.Router();
const Listing = require('../models/listing.js');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const {listingSchema, reviewSchema} = require("../schema.js");


//INDEX--READ-----------------------------
router.get('/', wrapAsync(async (req, res, next)=> {
    let allListings = await Listing.find({});
    res.render('./listings/index.ejs', {allListings});
}))

//NEW CREATION---CREATE-------------------
router.get('/new', (req, res) =>{
    res.render('./listings/new.ejs');
})
router.post('/', wrapAsync(async (req, res, next) =>{
    // if(!req.body.listing){
    //     throw new ExpressError(400, 'Send valid data for listinng');

    // }
    // let listing = req.body.listing;
    // console.log(listing);
    let result = listingSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400, result.error);
    }

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');
    
}))

//SINGLE SHOW----READ-----------------------
router.get('/:id', wrapAsync(async (req, res, next) =>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate('reviews');
    // console.log(listing);
    res.render('./listings/show.ejs', {listing});
}))

//EDIT AND UPDATE----------------------------
router.get('/:id/edit',wrapAsync( async (req, res, next) =>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render('./listings/edit.ejs', {listing});
}))

router.put('/:id', wrapAsync(async(req,res, next) =>{
    // if(!req.body.listing){
    // throw new ExpressError(400, 'Send valid data for listinng');

    // }
    let result = listingSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400, result.error);
    }
    
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
    
}))

//DELETE----DESTROY-----------------------
router.delete('/:id', wrapAsync(async (req, res, next) =>{
    let {id} = req.params;
    let deletedPost = await Listing.findByIdAndDelete(id);
    console.log(deletedPost);
    res.redirect('/listings');
}))

module.exports = router;