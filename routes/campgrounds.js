const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
//const ExpressError = require('../utils/ExpressError');
const {campgroundSchema , reviewSchema} = require('../schemas.js');
const Review = require('../models/review');
const multer = require('multer');
const {storage} =require('../cloudinary');
const upload = multer({ storage });
const {isAuthor, isLoggedIn, validateCampground} = require('../middleware')


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), catchAsync(campgrounds.createCampground))
    
    //.post(upload.array('image'), (req, res) => {
    //     console.log(req.body, req.files);
    //     res.send("IT WORKED!!")
    // })

router.get('/new', isLoggedIn, (campgrounds.renderNewForm));

// router.get('/new', (req, res)=>{
//     if(!req.isAuthenticated()){
//         req.flash('error', 'You must be signed in.')
//         res.redirect('/login');
//     }
//     res.render('campgrounds/new')
// })

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;