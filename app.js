const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv').config();
const usersRoute = require('./routes/users');
const fakerRoute = require('./routes/fakerRoute');
const profileRoute = require('./routes/profileSetup');

const app = express();

//DB connect
mongoose.set('useCreateIndex', true);
mongoose.connect("mongodb+srv://hyper:thabisoPassword@matchacluster-e6mcr.mongodb.net/test?retryWrites=true", {useNewUrlParser: true}, function(err, db){
  if (err)
  {
    console.log(err);
    console.log("unable to start the server");
  }else {
    console.log("Connected to server Successfully!!");
  }
});

app.use(session({
secret: process.env.SECRET, // session secret
resave: false,
saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//use welcome page
app.use('/welcome', function(err, req, res, next){
  res.render('login', {message: "Please make sure you are logged in"});
});

//use home page
app.use('/home', function(err, req, res, next){
  res.render('login', {message: "Please make sure you are logged in"});
});

//use settings page
app.use('/settings', function(err, req, res, next){
  console.log(err);
  res.render('login', {message: "Please make sure you are logged in"});
});

//users routes controller
app.use('/', usersRoute);

//profile setup and match routes controller
app.use('/', profileRoute);

//fake users routes controller
app.use('/fake', fakerRoute);

//handle the routes that are not found
app.use(function(req, res) {
  res.redirect('/');
});

//logout route
app.get('/logout', function(req, res){
  req.session.destroy(function(){
    console.log("User logged Out");
    res.render('login', {message: "User logged out"});
  });
});

//home route
app.get('/', function(req, res){
  res.render('index');
});

//start the server
app.listen(3000, function(){
    console.log("Our server has started on port 3000");
});


