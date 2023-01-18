if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const Joi = require('joi');
const {campgroundSchema , reviewSchema} = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');
const reviews = require('./controllers/reviews')
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const {isAuthor, isLoggedIn} = require('./middleware')

const MongoStore = require("connect-mongo");


const dbUrl = process.env.DB_URL || 'process.env.PORT';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true,
    //useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

const validateCampground =(req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(res.error){
        const msg = error.details.map(el.message.join(','))
        throw new ExpressError(msg, 400);
    } else{
        next();
    };
};

const validateReview = (req, res, next) =>{
    const {error}  = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
// app.use(mongoSanitize({
//     replaceWith: '_'
// }));
// app.use(session(sessionConfig))

// const store = new MongoStore ({
//     url: 'mongodb://localhost:27017/yelp-camp',
//     secret: 'thisshouldbeabettersecret',
//     touchAfter: 24 * 60 * 60
// });

// store.on("error", function (e) {
//     console.log("SESSION STORE ERROR", e)
// })

// const sessionConfig = {
//     store: MongoStore.create({ mongoUrl: dbUrl }),
//     name: 'session',
//     secret: 'thisshouldbeabettersecret',
//     resave: false,
//     saveUninitialized: true,
//     cookie:{
//         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
//         maxAge: 1000 * 60 * 60 * 24 * 7
//     }
// }
app.use(session({
    store: MongoStore.create({ mongoUrl: dbUrl, secret: 'thisshouldbeabettersecret',
    touchAfter: 24 * 60 * 60}),
    name: 'session',
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//how to store and unstore user in passport session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
//app.use('/campgrounds/:id/reviews', reviewRoutes)

app.post('/campgrounds/:id/reviews', isLoggedIn, validateReview, catchAsync(reviews.createReview))


app.delete('/campgrounds/:id/reviews/:reviewId', isLoggedIn, catchAsync(reviews.deleteReview))

app.get('/', (req, res) => {
    res.render('home')
});


app.all('*',(req, res, next) => {
    next(new ExpressError('page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('PORT HAS  BEEN CONNECTED SUCCESSFULLY');
})
