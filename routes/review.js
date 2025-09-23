const express = require("express");
const router = express.Router({mergeParams: true});
const Listing = require('../models/listing.js');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { reviewSchema} = require("../schema.js");
const Review = require('../models/review.js');
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");



//-----------------------------------------
//REVIEWS POST 
router.post('/',isLoggedIn, wrapAsync(async (req, res, ) =>{
    let result = reviewSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400, result.error);
    }
    
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    newReview.author = req.user._id;
    
    await newReview.save();

    listing.reviews.push(newReview);

    await listing.save();

    console.log('new review saved');
    res.redirect(`/listings/${req.params.id}`);
}))

//REVIEW DELETE---------------------------
router.delete('/:reviewId',isLoggedIn,isReviewAuthor, wrapAsync(async (req, res) =>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("edit", "Your review is deleted!");
    res.redirect(`/listings/${id}`);
}))

module.exports = router;