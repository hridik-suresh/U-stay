const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

main().then(()=>{
    console.log("connection to DB is successful...");
}).catch((err) =>{
    console.log(err);
})

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "68cfa4bfa83b6007e79ce99e" }));
    await Listing.insertMany(initData.data);
    console.log("data is initialized");
}

initDB();