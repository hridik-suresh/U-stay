const express = require("express");
const router = express.Router();
const Listing = require('../models/listing.js');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema, reviewSchema } = require("../schema.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


//INDEX--READ-----------------------------
router.get('/', wrapAsync(async (req, res, next)=> {
    let allListings = await Listing.find({});
    res.render('./listings/index.ejs', {allListings});
}))

//NEW CREATION---CREATE-------------------
router.get('/new',isLoggedIn, (req, res) => {
    res.render('./listings/new.ejs');
})
router.post('/',isLoggedIn, upload.single('listing[image]'), wrapAsync(async (req, res, next) =>{
    // if(!req.body.listing){
    //     throw new ExpressError(400, 'Send valid data for listinng');

    // }
    // let listing = req.body.listing;
    // console.log(listing);
    let result = listingSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400, result.error);
    }

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect('/listings');
    
}))


//SINGLE SHOW----READ-----------------------
router.get('/:id', wrapAsync(async (req, res, next) =>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path: 'reviews', populate: {path: 'author'}}).populate("owner");
    // console.log(listing);
    res.render('./listings/show.ejs', {listing});
}))

//EDIT AND UPDATE----------------------------
router.get('/:id/edit',isLoggedIn, isOwner, wrapAsync( async (req, res, next) =>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render('./listings/edit.ejs', {listing});
}))

router.put('/:id',isLoggedIn, isOwner,upload.single('listing[image]'), wrapAsync(async(req,res, next) =>{
    // if(!req.body.listing){
    // throw new ExpressError(400, 'Send valid data for listinng');

    // }
    let result = listingSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400, result.error);
    }
    
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();

    }
    req.flash("edit", "Listing Edited!");
    res.redirect(`/listings/${id}`);
    
}))

//DELETE----DESTROY-----------------------
router.delete('/:id',isLoggedIn, isOwner, wrapAsync(async (req, res, next) =>{
    let {id} = req.params;
    let deletedPost = await Listing.findByIdAndDelete(id);
    console.log(deletedPost);
    req.flash("dlt", "Listing was Deleted!");
    res.redirect('/listings');
}))

module.exports = router;