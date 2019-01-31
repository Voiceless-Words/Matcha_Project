const mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {type:String, required: true, index:{unique:true}},
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    email: {type:String, required: true},
    password: {type: String, required: true}
});

userSchema.pre('save', function(next){
    var user = this;

    if(!user.isModified('password')) return next();

    bcrypt.genSalt(process.env.SALT_WORK_FACTOR, function(err, salt){
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
