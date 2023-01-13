const {campgroundSchema , reviewSchema} = require('./schemas.js');
const ExpresErrors = require('./utils/ExpressError');
const Campground = require('./models/campground');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

// module.exports.validateCampground =(req, res, next) => {
//     const {error} = campgroundSchema.validate(req.body);
//     if(error){
//         if(error){
//            const msg = error.details.map(el.message).join(',') 
//            throw new ExpressError(msg, 400);
//     } else{
//         next();
//     };
// }};

module.exports.isAuthor = async(req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user.id)){
    req.flash('error', 'You do not have the permission to edit that!');
    return res.redirect(`/Campgrounds/${id}`);
}
    next()
}