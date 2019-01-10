let mongoose = require('mongoose');

//usrs schema
let userSchema = mongoose.Schema({
    first_name:{
        type: String,
        required: true
    },
    last_name:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
},
    { versionKey: false
});

let Users = module.exports = mongoose.model('Users', userSchema);