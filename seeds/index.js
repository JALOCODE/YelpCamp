const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "There is a connection error:"));
db.once("open", () => {
    console.log("Database connected Succesfully");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () =>{
    await Campground.deleteMany({});
    for(let i = 0; i < 200; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() *20) + 10;
        const camp = new Campground({
            //this is hard coded to my original author id.
            author: '632cfe8bf9f8f4742f13d674',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            price: price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [ 
                { 
                    url : "https://res.cloudinary.com/ddaeuuoc4/image/upload/v1666584141/YelpCamp/tyc7nxtx0alqybincukl.jpg",
                    filename : "YelpCamp/tyc7nxtx0alqybincukl" 
                }, 
                { 
                    url : "https://res.cloudinary.com/ddaeuuoc4/image/upload/v1666584144/YelpCamp/ax4yuxc2apzrtpwlay4h.jpg", 
                    filename : "YelpCamp/ax4yuxc2apzrtpwlay4h",
                } 
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})