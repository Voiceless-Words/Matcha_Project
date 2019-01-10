const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//DB connect
mongoose.connect('mongodb://localhost/matcha');
let db = mongoose.connection;

//connection successful
db.once('open', function(){
    console.log('Connected to mongodb');
});

//check for db errors
db.on('error', function(err){
    console.log(err);
});

//bring in model
let Users = require('./models/users');

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    Users.find({}, function(err, users){
        if(err)
        {
            console.log(err);
        }else{
            res.render('index', {
                title: 'Users',
                users : users
            });
        }
    });
});

//Sign up Route
app.get('/sign_up', function(req, res){
    res.render('sign_up');
});

//sign up post
app.post('/sign_up', function(req, res){
    let user = new Users();
    user.first_name = req.body.first_name;
    user.last_name = req.body.last_name;
    user.username = req.body.username;
    user.email = req.body.email;
    let salt = bcrypt.genSaltSync(saltRounds)
    let hash = bcrypt.hashSync(req.body.password, salt);
    user.password = hash;
    user.save(function(err){
        if(err){
            console.log(err);
        }else{
           res.redirect('/'); 
        }
    });
});

app.listen(3000, function(){
    console.log("Our server has started on port 3000");
})