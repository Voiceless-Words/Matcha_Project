const mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
const config = require('dotenv').config();
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {type:String, required: true, index:{unique:true}},
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    email: {type:String, required: true},
    age:{type:String, required: true},
    gender:{type:String, default: "Other"},
    genderPreference:{type:String, default: "Both"},
    LP: {type: String, default: "No"},
    NO: {type: String, default: "No"},
    LW: {type: String, default: "No"},
    SE: {type: String, default: "No"},
    MV: {type: String, default: "No"},
    RD: {type: String, default: "No"},
    bio:{type: String, default: ""},
    token: {type:String},
    status: {type:String, required: true},
    password: {type: String, required: true},
    profileImage: {type:String},
    images:[{contentType:{type:String}, img: {type:Buffer}}],
    active: {type:String},
    date: {type:Date, default:Date.now()},
    age: {type:Number},
    interets: []
});

userSchema.pre('save', function(next){
    var user = this;

    if(!user.isModified('password')) return next();

    bcrypt.genSalt(process.env.SALT_FACTOR, function(err, salt){
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function(err, hash){
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb){
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('Users', userSchema);
