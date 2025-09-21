const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({ 
    email: {
        type: String,
        required: true
    }
});

userSchema.plugin(passportLocalMongoose); //username and salted hashed form of password is automatically created in the schema

module.exports = mongoose.model('User', userSchema);
